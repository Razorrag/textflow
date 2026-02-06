/**
 * Web Worker Manager for TextFlow Humanizer
 * Handles communication with text processing worker
 */

interface WorkerMessage {
  id: string;
  type: 'analyze' | 'humanize' | 'rewrite' | 'check-plagiarism';
  data: any;
}

interface WorkerResponse {
  id: string;
  type: 'success' | 'error';
  result?: any;
  error?: string;
}

export class TextProcessorWorker {
  private worker: Worker | null = null;
  private pendingTasks = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>();
  private taskIdCounter = 0;

  constructor() {
    this.initializeWorker();
  }

  /**
   * Initialize the worker
   */
  private initializeWorker() {
    try {
      this.worker = new Worker(
        new URL('./textProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { id, type, result, error } = event.data;
        const task = this.pendingTasks.get(id);
        
        if (task) {
          this.pendingTasks.delete(id);
          
          if (type === 'success') {
            task.resolve(result);
          } else {
            task.reject(new Error(error || 'Unknown worker error'));
          }
        }
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        // Reject all pending tasks
        this.pendingTasks.forEach(({ reject }) => {
          reject(new Error('Worker crashed'));
        });
        this.pendingTasks.clear();
      };

    } catch (error) {
      console.error('Failed to initialize worker:', error);
      // Fallback to synchronous processing
      this.worker = null;
    }
  }

  /**
   * Execute a task in the worker
   */
  private async executeTask<T>(type: WorkerMessage['type'], data: any): Promise<T> {
    if (!this.worker) {
      throw new Error('Worker not available');
    }

    const id = `task_${++this.taskIdCounter}`;
    
    return new Promise<T>((resolve, reject) => {
      this.pendingTasks.set(id, { resolve, reject });
      
      // Set timeout for worker tasks
      const timeout = setTimeout(() => {
        this.pendingTasks.delete(id);
        reject(new Error('Worker task timeout'));
      }, 30000); // 30 second timeout

      this.worker!.postMessage({ id, type, data } as WorkerMessage);
      
      // Clear timeout if task completes
      Promise.resolve().then(() => {
        clearTimeout(timeout);
      });
    });
  }

  /**
   * Analyze text for AI detection and plagiarism
   */
  async analyzeText(text: string) {
    return this.executeTask('analyze', { text });
  }

  /**
   * Humanize text
   */
  async humanizeText(text: string, mode?: string) {
    return this.executeTask('humanize', { text, mode });
  }

  /**
   * Rewrite text
   */
  async rewriteText(text: string, mode: string) {
    return this.executeTask('rewrite', { text, mode });
  }

  /**
   * Check plagiarism
   */
  async checkPlagiarism(text: string) {
    return this.executeTask('check-plagiarism', { text });
  }

  /**
   * Terminate the worker
   */
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingTasks.clear();
  }

  /**
   * Check if worker is available
   */
  get isAvailable(): boolean {
    return this.worker !== null;
  }
}

// Export singleton instance
export const textProcessorWorker = new TextProcessorWorker();
