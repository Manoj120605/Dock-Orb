/**
 * AI reads/writes files based on n8n outputs
 */

import * as fs from 'fs';
import * as path from 'path';

export class FileSystemAdapter {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  public writeFile(relativePath: string, content: string): void {
    const fullPath = path.join(this.rootPath, relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  public readFile(relativePath: string): string {
    const fullPath = path.join(this.rootPath, relativePath);
    return fs.readFileSync(fullPath, 'utf8');
  }
}
