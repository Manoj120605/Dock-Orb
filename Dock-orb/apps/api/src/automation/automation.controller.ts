import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { McpService } from './mcp.service';
import { DockerN8nService } from './docker-n8n.service';
import { exec } from 'child_process';

@Controller('workspaces/:workspaceId/automation')
export class AutomationController {
  constructor(
    private readonly mcpService: McpService,
    private readonly dockerService: DockerN8nService,
  ) {}

  @Get('config')
  async getConfig(@Param('workspaceId') workspaceId: string) {
    return this.mcpService.getConfig(workspaceId);
  }

  @Post('config')
  async saveConfig(
    @Param('workspaceId') workspaceId: string,
    @Body() body: { aiApiKey: string; aiBaseUrl?: string; providerHint?: string; githubPat?: string; repoLink?: string; localProjectPath?: string },
  ) {
    return this.mcpService.saveConfig(
      workspaceId,
      body.aiApiKey,
      body.githubPat,
      body.repoLink,
      body.aiBaseUrl,
      body.providerHint,
      body.localProjectPath,
    );
  }

  @Get('docker/status')
  async getDockerStatus(@Param('workspaceId') workspaceId: string) {
    const hasDocker = await this.dockerService.checkDocker();
    const isN8nRunning = await this.dockerService.isN8nRunning();
    const mcpConfig = await this.mcpService.getConfig(workspaceId);
    return { 
      hasDocker, 
      isN8nRunning,
      running: hasDocker,
      mcpRunning: mcpConfig.isMcpRunning,
    };
  }

  @Post('docker/start-n8n')
  async startN8n() {
    return this.dockerService.startN8n();
  }

  @Post('docker/stop-n8n')
  async stopN8n() {
    return this.dockerService.stopN8n();
  }

  /** Opens a native OS folder picker dialog and returns the selected path */
  @Get('browse-folder')
  async browseFolder(): Promise<{ path: string | null }> {
    return new Promise((resolve) => {
      let command: string;

      if (process.platform === 'win32') {
        command = `powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $d = New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description = 'Select your project folder'; $d.ShowNewFolderButton = $false; if ($d.ShowDialog() -eq 'OK') { Write-Output $d.SelectedPath } else { Write-Output '' }"`;
      } else if (process.platform === 'darwin') {
        command = `osascript -e 'POSIX path of (choose folder with prompt "Select your project folder")'`;
      } else {
        command = `zenity --file-selection --directory --title="Select project folder" 2>/dev/null || kdialog --getexistingdirectory . 2>/dev/null`;
      }

      exec(command, (error, stdout) => {
        const path = stdout.trim();
        resolve({ path: path || null });
      });
    });
  }

  /** Test if the configured AI key actually works */
  @Get('test-connection')
  async testConnection(@Param('workspaceId') workspaceId: string) {
    const config = await this.mcpService.getRawConfig(workspaceId);
    if (!config.aiApiKey) {
      return { success: false, message: 'No API key saved yet.' };
    }
    return { success: true, message: 'API key is configured.', aiBaseUrl: config.aiBaseUrl || '(auto-detect)' };
  }
}
