/**
 * Manages project state and memory (RAG/Vector DB integration)
 */

export class ContextManager {
  private memory: Map<string, any>;

  constructor() {
    this.memory = new Map();
  }

  public store(key: string, data: any): void {
    this.memory.set(key, data);
  }

  public retrieve(key: string): any {
    return this.memory.get(key);
  }

  public clear(): void {
    this.memory.clear();
  }
}
