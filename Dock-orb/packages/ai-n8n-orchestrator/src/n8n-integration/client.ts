/**
 * API client to communicate with your n8n instance via REST
 */
import axios, { AxiosInstance } from 'axios';

export class N8nClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:5678', apiKey: string = '') {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['X-N8N-API-KEY'] = apiKey;
    }

    this.client = axios.create({
      baseURL: `${baseURL.replace(/\/$/, '')}/api/v1`,
      headers,
      timeout: 10000,
    });
  }

  /**
   * Create a new workflow in n8n
   */
  public async createWorkflow(workflowData: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.post('/workflows', workflowData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create n8n workflow:', error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * List workflows in n8n
   */
  public async listWorkflows(): Promise<any> {
    try {
      const response = await this.client.get('/workflows');
      return response.data;
    } catch (error: any) {
      console.error('Failed to list n8n workflows:', error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Activate a workflow in n8n
   */
  public async activateWorkflow(workflowId: string): Promise<any> {
    try {
      const response = await this.client.post(`/workflows/${workflowId}/activate`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to activate workflow ${workflowId}:`, error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Execute workflow manually
   */
  public async executeWorkflow(workflowId: string, data: any = {}): Promise<any> {
    try {
      const response = await this.client.post(`/workflows/${workflowId}/execute`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to execute workflow ${workflowId}:`, error?.response?.data || error.message);
      throw error;
    }
  }
}
