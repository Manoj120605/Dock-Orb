import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class DockerN8nService {
  private readonly logger = new Logger(DockerN8nService.name);

  async checkDocker(): Promise<boolean> {
    try {
      await execAsync('docker info');
      return true;
    } catch (e) {
      this.logger.error('Docker is not running or installed', e);
      return false;
    }
  }

  async isN8nRunning(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('docker ps -q -f name=dock-orb-n8n');
      return stdout.trim().length > 0;
    } catch (e) {
      return false;
    }
  }

  async startN8n(): Promise<{ success: boolean; message: string }> {
    const hasDocker = await this.checkDocker();
    if (!hasDocker) {
      return { success: false, message: 'Docker is not installed or running. Please install Docker Desktop.' };
    }

    const isRunning = await this.isN8nRunning();
    if (isRunning) {
      return { success: true, message: 'n8n is already running.' };
    }

    try {
      // Check if container exists but is stopped
      const { stdout } = await execAsync('docker ps -aq -f name=dock-orb-n8n');
      if (stdout.trim().length > 0) {
        await execAsync('docker start dock-orb-n8n');
        this.logger.log('Started existing dock-orb-n8n container.');
      } else {
        await execAsync('docker run -d --name dock-orb-n8n -p 5678:5678 n8nio/n8n');
        this.logger.log('Spawned new dock-orb-n8n container.');
      }
      return { success: true, message: 'n8n started successfully on port 5678.' };
    } catch (error: any) {
      this.logger.error('Failed to start n8n', error.message);
      return { success: false, message: `Failed to start n8n: ${error.message}` };
    }
  }

  async stopN8n(): Promise<{ success: boolean; message: string }> {
    try {
      await execAsync('docker stop dock-orb-n8n');
      return { success: true, message: 'n8n stopped.' };
    } catch (e: any) {
      return { success: false, message: `Failed to stop n8n: ${e.message}` };
    }
  }
}
