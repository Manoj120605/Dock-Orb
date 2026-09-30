/**
 * REST API client to communicate with an n8n instance
 */
import axios, { AxiosInstance } from 'axios';

export class N8nClient {
  private client: AxiosInstance;

  constructor(baseURL = 'http://localhost:5678', apiKey = '') {
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

  public async createWorkflow(workflowData: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.post('/workflows', workflowData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create n8n workflow:', error?.response?.data || error.message);
      throw error;
    }
  }

  public async listWorkflows(): Promise<any> {
    try {
      const response = await this.client.get('/workflows');
      return response.data;
    } catch (error: any) {
      console.error('Failed to list n8n workflows:', error?.response?.data || error.message);
      throw error;
    }
  }

  public async activateWorkflow(workflowId: string): Promise<any> {
    try {
      const response = await this.client.post(`/workflows/${workflowId}/activate`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to activate workflow ${workflowId}:`, error?.response?.data || error.message);
      throw error;
    }
  }

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
