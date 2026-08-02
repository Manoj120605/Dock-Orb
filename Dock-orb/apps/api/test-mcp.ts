import { PrismaClient } from '@prisma/client';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const prisma = new PrismaClient();
  const config = await prisma.providerConfig.findUnique({
    where: { workspaceId_provider: { workspaceId: 'default-workspace', provider: 'ai-automation' } }
  });
  
  console.log("Config routingRules:", config?.routingRules);
  
  if (config?.routingRules) {
    const parsed = JSON.parse(config.routingRules as string);
    const localPath = parsed.localProjectPath;
    console.log("Local Path:", localPath);
    
    if (localPath) {
      console.log("Starting npx -y @modelcontextprotocol/server-filesystem", localPath);
      const transport = new StdioClientTransport({
        command: 'node',
        args: [require.resolve('@modelcontextprotocol/server-filesystem/dist/index.js'), localPath],
        env: process.env as Record<string, string>,
      });

      const client = new Client({ name: `test`, version: '1.0.0' }, { capabilities: {} });
      
      try {
        await client.connect(transport);
        console.log("Connected!");
        const tools = await client.listTools();
        console.log("Tools found:", tools.tools.map((t: any) => t.name));
        await client.close();
      } catch (e) {
        console.error("Connection failed:", e);
      }
    } else {
      console.log("No local path configured!");
    }
  }
}

main().catch(console.error);
