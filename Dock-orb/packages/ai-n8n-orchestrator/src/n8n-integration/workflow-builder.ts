/**
 * AI dynamically generates actual n8n-compatible workflow JSON specifications
 */

export interface WorkflowStep {
  name: string;
  type: string;
  params?: Record<string, any>;
  notes?: string;
}

export class WorkflowBuilder {
  /**
   * Generates a complete, valid n8n workflow JSON structure from a user prompt
   */
  public generateFromPrompt(prompt: string): Record<string, any> {
    const lowerPrompt = prompt.toLowerCase();
    
    const nodes: any[] = [];
    const connections: Record<string, any> = {};

    // 1. Determine Trigger Node
    let triggerNodeName = 'Start Trigger';
    let triggerNodeType = 'n8n-nodes-base.manualTrigger';
    let triggerParams: Record<string, any> = {};

    if (lowerPrompt.includes('webhook') || lowerPrompt.includes('pr') || lowerPrompt.includes('github')) {
      triggerNodeName = 'Webhook Trigger';
      triggerNodeType = 'n8n-nodes-base.webhook';
      triggerParams = {
        path: 'dock-orb-webhook',
        responseMode: 'onReceived',
        options: {},
      };
    } else if (lowerPrompt.includes('schedule') || lowerPrompt.includes('cron') || lowerPrompt.includes('daily')) {
      triggerNodeName = 'Schedule Trigger';
      triggerNodeType = 'n8n-nodes-base.scheduleTrigger';
      triggerParams = {
        rule: {
          interval: [{ field: 'hours', hoursInterval: 24 }],
        },
      };
    }

    nodes.push({
      id: 'node_trigger',
      name: triggerNodeName,
      type: triggerNodeType,
      typeVersion: 1,
      position: [250, 300],
      parameters: triggerParams,
    });

    // 2. Determine AI Processing Node
    let processNodeName = 'AI Context Analysis';
    let processNodeType = 'n8n-nodes-base.httpRequest';
    let processParams: Record<string, any> = {
      method: 'POST',
      url: 'http://localhost:3001/api/v1/chat/completions',
      sendHeaders: true,
      headerParameters: {
        parameters: [{ name: 'Content-Type', value: 'application/json' }],
      },
      sendBody: true,
      bodyParameters: {
        parameters: [{ name: 'prompt', value: `Process request for: ${prompt}` }],
      },
      options: {},
    };

    if (lowerPrompt.includes('code') || lowerPrompt.includes('transform')) {
      processNodeName = 'Transform Data Code';
      processNodeType = 'n8n-nodes-base.code';
      processParams = {
        jsCode: `// Automatically generated code transformation\nconst items = $input.all();\nreturn items.map(item => ({ json: { ...item.json, processedAt: new Date().toISOString(), context: "${prompt.replace(/"/g, '\\"')}" } }));`,
      };
    }

    nodes.push({
      id: 'node_process',
      name: processNodeName,
      type: processNodeType,
      typeVersion: 1,
      position: [550, 300],
      parameters: processParams,
    });

    // Connect Trigger -> Process
    connections[triggerNodeName] = {
      main: [
        [
          {
            node: processNodeName,
            type: 'main',
            index: 0,
          },
        ],
      ],
    };

    // 3. Determine Action Node
    let actionNodeName = 'Notify Output';
    let actionNodeType = 'n8n-nodes-base.httpRequest';
    let actionParams: Record<string, any> = {
      method: 'POST',
      url: 'http://localhost:3001/api/v1/capsules',
      sendHeaders: true,
      headerParameters: {
        parameters: [{ name: 'Content-Type', value: 'application/json' }],
      },
      sendBody: true,
      bodyParameters: {
        parameters: [
          { name: 'workspaceId', value: 'default-workspace' },
          { name: 'name', value: `Execution Result: ${prompt}` },
          { name: 'type', value: 'TASK' },
        ],
      },
      options: {},
    };

    if (lowerPrompt.includes('slack')) {
      actionNodeName = 'Send Slack Notification';
      actionNodeType = 'n8n-nodes-base.slack';
      actionParams = {
        channel: '#automations',
        text: `Workflow Result for: ${prompt}`,
      };
    } else if (lowerPrompt.includes('email')) {
      actionNodeName = 'Send Email';
      actionNodeType = 'n8n-nodes-base.emailSend';
      actionParams = {
        toEmail: 'team@capsule.ai',
        subject: `Dock-Orb Workflow: ${prompt}`,
      };
    }

    nodes.push({
      id: 'node_action',
      name: actionNodeName,
      type: actionNodeType,
      typeVersion: 1,
      position: [850, 300],
      parameters: actionParams,
    });

    // Connect Process -> Action
    connections[processNodeName] = {
      main: [
        [
          {
            node: actionNodeName,
            type: 'main',
            index: 0,
          },
        ],
      ],
    };

    return {
      name: prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt,
      active: true,
      nodes,
      connections,
      settings: {
        executionOrder: 'v1',
      },
      tags: ['capsule-ai', 'dock-orb'],
    };
  }

  /**
   * Generates an n8n compatible workflow JSON from defined steps
   */
  public buildWorkflow(steps: WorkflowStep[], name: string = 'Generated Workflow'): Record<string, any> {
    const nodes: any[] = [];
    const connections: Record<string, any> = {};

    steps.forEach((step, index) => {
      const nodeName = step.name || `Step ${index + 1}`;
      nodes.push({
        id: `node_${index + 1}`,
        name: nodeName,
        type: step.type || 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [250 * (index + 1), 300],
        parameters: step.params || {},
      });

      if (index > 0) {
        const prevNodeName = steps[index - 1].name || `Step ${index}`;
        connections[prevNodeName] = {
          main: [
            [
              {
                node: nodeName,
                type: 'main',
                index: 0,
              },
            ],
          ],
        };
      }
    });

    return {
      name,
      active: true,
      nodes,
      connections,
      settings: {
        executionOrder: 'v1',
      },
    };
  }
}
