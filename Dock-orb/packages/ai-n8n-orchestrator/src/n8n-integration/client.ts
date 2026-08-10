/**
 * API client to communicate with your n8n instance via REST
 */
import axios, { AxiosInstance } from 'axios';

export class N8nClient {
  private client: AxiosInstance;

  constructor(baseURL: string, apiKey: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  public async executeWorkflow(workflowId: string, data: any): Promise<any> {
    try {
      const response = await this.client.post(`/workflows/${workflowId}/execute`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to execute workflow ${workflowId}:`, error);
      throw error;
    }
  }
}
