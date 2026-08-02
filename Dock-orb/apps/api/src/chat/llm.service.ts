import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import OpenAI from 'openai';
import { McpService } from '../automation/mcp.service';
import { ChatGateway } from './chat.gateway';

// Auto-detect provider and return sensible defaults
function detectProvider(apiKey: string, baseUrl: string, providerHint?: string): { baseURL: string; model: string } {
  // Explicit provider hint always wins
  if (providerHint) {
    switch (providerHint) {
      case 'gemini':
        // gemini-1.5-flash-8b: 4000 RPM free, gemini-2.0-flash: only 15 RPM free
        return { baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/', model: 'gemini-1.5-flash-8b' };
      case 'openai':
        return { baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };
      case 'groq':
        return { baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' };
      case 'nvidia':
        return { baseURL: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama-3.3-70b-instruct' };
      case 'deepseek':
        return { baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-chat' };
      case 'anthropic':
        return { baseURL: 'https://api.anthropic.com/v1', model: 'claude-3-5-sonnet-20241022' };
      case 'openrouter':
        return { baseURL: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' };
      case 'ollama':
        return { baseURL: baseUrl || 'http://localhost:11434/v1', model: 'llama3.2' };
    }
  }

  // User gave an explicit base URL
  if (baseUrl && baseUrl.trim() !== '') {
    const url = baseUrl.toLowerCase();
    if (url.includes('nvidia') || url.includes('nim')) return { baseURL: baseUrl, model: 'meta/llama-3.3-70b-instruct' };
    if (url.includes('groq')) return { baseURL: baseUrl, model: 'llama-3.3-70b-versatile' };
    if (url.includes('deepseek')) return { baseURL: baseUrl, model: 'deepseek-chat' };
    if (url.includes('anthropic')) return { baseURL: baseUrl, model: 'claude-3-5-sonnet-20241022' };
    if (url.includes('generativelanguage') || url.includes('google')) return { baseURL: baseUrl, model: 'gemini-1.5-flash-8b' };
    if (url.includes('ollama') || url.includes('11434')) return { baseURL: baseUrl, model: 'llama3.2' };
    return { baseURL: baseUrl, model: 'gpt-4o-mini' };
  }

  // No base URL — detect from API key prefix
  const key = (apiKey || '').trim();

  // Google Gemini — keys start with AIza OR AQ. (newer format from AI Studio)
  if (key.startsWith('AIza') || key.startsWith('AQ.') || key.startsWith('AQ-')) {
    return {
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      model: 'gemini-2.0-flash',
    };
  }
  if (key.startsWith('gsk_')) {
    return { baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' };
  }
  if (key.startsWith('nvapi-')) {
    return { baseURL: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama-3.3-70b-instruct' };
  }
  if (key.startsWith('sk-ant-')) {
    return { baseURL: 'https://api.anthropic.com/v1', model: 'claude-3-5-sonnet-20241022' };
  }
  if (key.startsWith('sk-or-v1-')) {
    return { baseURL: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o' };
  }
  if (key.startsWith('sk-')) {
    return { baseURL: 'https://api.openai.com/v1', model: 'gpt-4o' };
  }

  // Unknown — default to Gemini since it's free tier friendly
  return {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    model: 'gemini-2.0-flash',
  };
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private readonly mcpService: McpService,
    @Inject(forwardRef(() => ChatGateway)) private readonly chatGateway: ChatGateway,
  ) {}

  async generateResponse(
    messages: { role: string; content: string }[],
    aiApiKey: string,
    userBaseUrl: string | undefined,
    providerHint?: string,
    workspaceId?: string,
  ): Promise<{ response: string; usage?: any }> {
    if (!aiApiKey || aiApiKey.trim() === '') {
      throw new Error('No AI API key configured. Go to Automations and save your key.');
    }

    const { baseURL, model } = detectProvider(aiApiKey, userBaseUrl || '', providerHint);
    this.logger.log(`Using provider: ${baseURL} | model: ${model}`);

    const openai = new OpenAI({
      apiKey: aiApiKey.trim(),
      baseURL,
      defaultHeaders: {
        // Some providers need this
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Dock-Orb',
      },
    });

    try {
      // 1. Try to fetch MCP tools (empty if MCP not connected — that's fine)
      const mcpToolsRaw = await this.mcpService.getTools();
      const tools: any[] = mcpToolsRaw.map((tool: any) => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema || { type: 'object', properties: {} },
        },
      }));

      // 2. Tool call loop (max 5 iterations)
      let currentMessages = [...messages] as any[];
      
      // Inject System Prompt at the beginning
      const systemPrompt = {
        role: 'system',
        content: `You are Dock-Orb AI, an advanced agentic coding assistant.
You have access to MCP (Model Context Protocol) tools.
CRITICAL INSTRUCTIONS:
- You must use your provided tools to directly fulfill the user's requests.
- DO NOT just write code blocks and tell the user to manually copy/paste or save them. YOU must use the \`write_file\` or \`edit_file\` tools to do it yourself!
- If the user asks you to create a file, CREATE IT using the tool.
- If the user asks you to read a file, READ IT using the tool.
- If the user asks you to commit or push, USE the github tools to do so.
Always act proactively using tools.`
      };
      
      if (currentMessages.length === 0 || currentMessages[0].role !== 'system') {
        currentMessages.unshift(systemPrompt);
      }

      let finalResponse = '';
      let usageInfo: any = null;

      for (let i = 0; i < 5; i++) {
        const completionParams: any = {
          model,
          messages: currentMessages,
          temperature: 0.7,
        };

        if (tools.length > 0) {
          completionParams.tools = tools;
        }

        let completion: any;
        let retries = 0;
        while (retries < 3) {
          try {
            completion = await openai.chat.completions.create(completionParams);
            break; // Success
          } catch (err: any) {
            if (err.status === 429 || err.message?.includes('429') || err.message?.includes('rate limit')) {
              retries++;
              this.logger.warn(`Rate limit hit (429). Retrying in ${retries * 2} seconds...`);
              await new Promise(res => setTimeout(res, retries * 2000));
              if (retries === 3) throw err; // Give up after 3 retries
            } else {
              throw err;
            }
          }
        }

        const choice = completion.choices[0];
        usageInfo = completion.usage;

        if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls?.length) {
          currentMessages.push(choice.message);
          this.logger.debug(`Tool calls: ${choice.message.tool_calls.map((t: any) => t.function.name).join(', ')}`);

          for (const toolCall of choice.message.tool_calls) {
            const { name, arguments: argsString } = (toolCall as any).function;
            let toolResult;
            try {
              const args = JSON.parse(argsString);
              if (workspaceId) this.chatGateway.emitToolStart(workspaceId, name, args);
              toolResult = await this.mcpService.callTool(name, args);
              if (workspaceId) this.chatGateway.emitToolEnd(workspaceId, name, toolResult);
              currentMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(toolResult) });
            } catch (err) {
              if (workspaceId) this.chatGateway.emitToolEnd(workspaceId, name, { error: String(err) });
              currentMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify({ error: String(err) }) });
            }
          }
        } else {
          finalResponse = choice.message.content || '';
          break;
        }
      }

      return { response: finalResponse, usage: usageInfo };
    } catch (e: any) {
      this.logger.error('LLM call failed', e?.message || e);

      // Surface a readable error message
      const raw = e?.message || String(e);
      if (raw.includes('401') || raw.includes('Unauthorized') || raw.includes('API key')) {
        throw new Error('Invalid API key. Check your key in the Automations tab.');
      }
      if (raw.includes('404') || raw.includes('model')) {
        throw new Error(`Model not found. Try a different model name (detected: ${detectProvider(aiApiKey, userBaseUrl || '').model}).`);
      }
      if (raw.includes('429') || raw.includes('rate')) {
        throw new Error('Rate limit hit. Please wait a moment and try again.');
      }
      throw new Error(`AI error: ${raw}`);
    }
  }
}
