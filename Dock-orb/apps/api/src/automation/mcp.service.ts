import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { spawn, ChildProcess } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

@Injectable()
export class McpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpService.name);
  private clients = new Map<string, Client>();
  private processes = new Map<string, ChildProcess>();
  private toolToClientMap = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.syncMcpServers('default-workspace');
  }

  async onModuleDestroy() {
    await this.stopAllMcpServers();
  }

  private async ensureWorkspace(workspaceId: string) {
    await this.prisma.workspace.upsert({
      where: { id: workspaceId },
      create: {
        id: workspaceId,
        name: 'Default Workspace',
        description: 'Auto-created workspace',
        settings: {},
      },
      update: {},
    });
  }

  async saveConfig(
    workspaceId: string,
    aiApiKey: string,
    githubPat?: string,
    repoLink?: string,
    aiBaseUrl?: string,
    providerHint?: string,
    localProjectPath?: string,
  ) {
    await this.ensureWorkspace(workspaceId);
    
    // Save AI provider & local project config
    const aiConfig = JSON.stringify({ aiBaseUrl: aiBaseUrl || '', localProjectPath: localProjectPath || '', providerHint: providerHint || '' });
    await this.prisma.providerConfig.upsert({
      where: { workspaceId_provider: { workspaceId, provider: 'ai-automation' } },
      create: {
        workspaceId,
        provider: 'ai-automation',
        displayName: 'AI Automation',
        apiKeyEnc: aiApiKey,
        routingRules: aiConfig,
        models: [],
      },
      update: {
        apiKeyEnc: aiApiKey,
        routingRules: aiConfig,
      },
    });

    // Save GitHub config
    if (githubPat && githubPat.trim() !== '') {
      const config = JSON.stringify({ repoLink: repoLink || '' });
      await this.prisma.providerConfig.upsert({
        where: { workspaceId_provider: { workspaceId, provider: 'github-mcp' } },
        create: {
          workspaceId,
          provider: 'github-mcp',
          displayName: 'GitHub MCP Server',
          apiKeyEnc: githubPat,
          routingRules: config,
          models: [],
        },
        update: {
          apiKeyEnc: githubPat,
          routingRules: config,
        },
      });
    } else {
      // Clear github config if empty
      await this.prisma.providerConfig.deleteMany({
        where: { workspaceId, provider: 'github-mcp' }
      });
    }

    // Sync all MCP servers based on the new configs
    await this.syncMcpServers(workspaceId);
    
    return { success: true, message: 'Configuration saved and MCP servers initialized.' };
  }

  async getConfig(workspaceId: string) {
    const aiConfig = await this.prisma.providerConfig.findUnique({
      where: { workspaceId_provider: { workspaceId, provider: 'ai-automation' } },
    });
    const githubConfig = await this.prisma.providerConfig.findUnique({
      where: { workspaceId_provider: { workspaceId, provider: 'github-mcp' } },
    });

    let repoLink = '';
    let aiBaseUrl = '';
    let localProjectPath = '';

    if (githubConfig?.routingRules) {
      try { repoLink = JSON.parse(githubConfig.routingRules as string).repoLink || ''; } catch (e) {}
    }
    if (aiConfig?.routingRules) {
      try {
        const parsed = JSON.parse(aiConfig.routingRules as string);
        aiBaseUrl = parsed.aiBaseUrl || '';
        localProjectPath = parsed.localProjectPath || '';
      } catch (e) {}
    }

    return {
      aiApiKey: aiConfig?.apiKeyEnc ? '********' : '',
      aiBaseUrl,
      localProjectPath,
      githubPat: githubConfig?.apiKeyEnc ? '********' : '',
      repoLink,
      isMcpRunning: this.clients.size > 0,
    };
  }

  async getRawConfig(workspaceId: string) {
    const aiConfig = await this.prisma.providerConfig.findUnique({
      where: { workspaceId_provider: { workspaceId, provider: 'ai-automation' } },
    });
    
    let aiBaseUrl = '';
    let localProjectPath = '';
    let providerHint = '';
    if (aiConfig?.routingRules) {
      try {
        const parsed = JSON.parse(aiConfig.routingRules as string);
        aiBaseUrl = parsed.aiBaseUrl || '';
        localProjectPath = parsed.localProjectPath || '';
        providerHint = parsed.providerHint || '';
      } catch (e) {}
    }

    return {
      aiApiKey: aiConfig?.apiKeyEnc || '',
      aiBaseUrl,
      localProjectPath,
      providerHint,
    };
  }

  private async syncMcpServers(workspaceId: string) {
    await this.stopAllMcpServers();
    
    const githubConfig = await this.prisma.providerConfig.findUnique({
      where: { workspaceId_provider: { workspaceId, provider: 'github-mcp' } },
    });
    const aiConfig = await this.prisma.providerConfig.findUnique({
      where: { workspaceId_provider: { workspaceId, provider: 'ai-automation' } },
    });

    // 1. Start GitHub MCP if configured
    if (githubConfig?.apiKeyEnc) {
      let repoLink = '';
      try { repoLink = JSON.parse(githubConfig.routingRules as string).repoLink || ''; } catch (e) {}
      await this.startServer(
        'github', 
        ['@modelcontextprotocol/server-github'], 
        { GITHUB_PERSONAL_ACCESS_TOKEN: githubConfig.apiKeyEnc }
      );
    }

    // 2. Start Filesystem MCP if configured
    if (aiConfig?.routingRules) {
      try {
        const parsed = JSON.parse(aiConfig.routingRules as string);
        if (parsed.localProjectPath && parsed.localProjectPath.trim() !== '') {
          // npx -y @modelcontextprotocol/server-filesystem /path/to/project
          await this.startServer(
            'filesystem',
            ['@modelcontextprotocol/server-filesystem', parsed.localProjectPath],
            {}
          );
        }
      } catch (e) {}
    }
  }

  private async startServer(serverId: string, packageArgs: string[], extraEnv: Record<string, string>) {
    this.logger.log(`Starting MCP Server: ${serverId}`);
    
    const processEnv = { ...process.env, ...extraEnv } as Record<string, string>;

    let spawnCmd = 'node';
    let spawnArgs = packageArgs;
    
    // In a monorepo, dependencies are hoisted to the root node_modules. We use require.resolve to find them.
    if (packageArgs[0] === '@modelcontextprotocol/server-filesystem') {
      const scriptPath = require.resolve('@modelcontextprotocol/server-filesystem/dist/index.js');
      spawnArgs = [scriptPath, packageArgs[1]];
    } else if (packageArgs[0] === '@modelcontextprotocol/server-github') {
      const scriptPath = require.resolve('@modelcontextprotocol/server-github/dist/index.js');
      spawnArgs = [scriptPath];
    }

    const mcpProcess = spawn(spawnCmd, spawnArgs, { env: processEnv, shell: false });
    this.processes.set(serverId, mcpProcess);

    const transport = new StdioClientTransport({
      command: spawnCmd,
      args: spawnArgs,
      env: processEnv,
    });

    const mcpClient = new Client({ name: `capsule-client-${serverId}`, version: '1.0.0' }, { capabilities: {} });

    try {
      await mcpClient.connect(transport);
      this.clients.set(serverId, mcpClient);
      this.logger.log(`Connected to MCP Server ${serverId} via Stdio Transport`);
    } catch (e) {
      this.logger.error(`Failed to connect to MCP Server ${serverId}`, e);
    }
  }

  async getTools() {
    this.toolToClientMap.clear();
    const allTools = [];

    for (const [serverId, client] of this.clients.entries()) {
      try {
        const response = await client.listTools();
        for (const tool of response.tools) {
          // Keep a map so we know which client to call for this tool
          this.toolToClientMap.set(tool.name, serverId);
          allTools.push(tool);
        }
      } catch (e) {
        this.logger.error(`Failed to list tools for ${serverId}`, e);
      }
    }
    return allTools;
  }

  async callTool(name: string, args: any) {
    const serverId = this.toolToClientMap.get(name);
    if (!serverId) {
      throw new Error(`Tool ${name} not found in any connected MCP server.`);
    }

    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`MCP Client ${serverId} not connected`);
    }

    this.logger.debug(`Calling tool ${name} on server ${serverId}`);
    const response = await client.callTool({ name, arguments: args });
    return response.content;
  }

  async stopAllMcpServers() {
    for (const client of this.clients.values()) {
      try { await client.close(); } catch(e) {}
    }
    this.clients.clear();
    this.toolToClientMap.clear();

    for (const [id, proc] of this.processes.entries()) {
      try { proc.kill(); } catch(e) {}
    }
    this.processes.clear();
    this.logger.log('Stopped all MCP Servers.');
  }
}
