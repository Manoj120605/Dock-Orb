import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { spawn, ChildProcess } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

@Injectable()
export class McpService implements OnModuleDestroy {
  private readonly logger = new Logger(McpService.name);
  private mcpProcess: ChildProcess | null = null;
  private mcpClient: Client | null = null;

  constructor(private prisma: PrismaService) {}

  async onModuleDestroy() {
    await this.stopMcpServer();
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
    // Ensure workspace row exists (creates it if first run)
    await this.ensureWorkspace(workspaceId);
    // Save AI provider config
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

    // Save GitHub config only if PAT is provided
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
      // Start MCP server automatically
      await this.startMcpServer(githubPat, repoLink || '');
      return { success: true, message: 'Saved. GitHub MCP server is starting...' };
    }

    // No PAT provided — stop any running MCP server
    await this.stopMcpServer();
    return { success: true, message: 'Saved. Using local/direct AI mode (no GitHub MCP).' };
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
      isMcpRunning: this.mcpClient !== null,
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

  async startMcpServer(pat: string, repoLink: string) {
    await this.stopMcpServer();

    this.logger.log(`Starting GitHub MCP Server for repo: ${repoLink}`);
    
    // We run the official github mcp server via npx
    this.mcpProcess = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['-y', '@modelcontextprotocol/server-github'], {
      env: {
        ...process.env,
        GITHUB_PERSONAL_ACCESS_TOKEN: pat,
      },
      shell: false,
    });

    const transport = new StdioClientTransport({
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        ...process.env,
        GITHUB_PERSONAL_ACCESS_TOKEN: pat,
      },
    });

    this.mcpClient = new Client({ name: 'capsule-client', version: '1.0.0' }, { capabilities: {} });

    try {
      await this.mcpClient.connect(transport);
      this.logger.log('Connected to MCP Server via Stdio Transport');
    } catch (e) {
      this.logger.error('Failed to connect to MCP Server', e);
    }
  }

  async getTools() {
    if (!this.mcpClient) return [];
    try {
      const response = await this.mcpClient.listTools();
      return response.tools;
    } catch (e) {
      this.logger.error('Failed to list tools', e);
      return [];
    }
  }

  async callTool(name: string, args: any) {
    if (!this.mcpClient) throw new Error('MCP Client not connected');
    this.logger.debug(`Calling tool ${name}`);
    const response = await this.mcpClient.callTool({ name, arguments: args });
    return response.content;
  }

  async stopMcpServer() {
    if (this.mcpClient) {
      try { await this.mcpClient.close(); } catch(e) {}
      this.mcpClient = null;
    }
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
    }
    this.logger.log('Stopped MCP Server.');
  }
}
