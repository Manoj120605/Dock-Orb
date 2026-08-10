/**
 * Creates and manages isolated project directories/containers
 */

import * as fs from 'fs';
import * as path from 'path';

export class WorkspaceManager {
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
  }

  public createWorkspace(projectName: string): string {
    const workspacePath = path.join(this.baseDir, 'workspaces', projectName);
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
      console.log(`Created workspace for ${projectName} at ${workspacePath}`);
    }
    return workspacePath;
  }
}
