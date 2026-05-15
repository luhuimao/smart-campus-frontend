type Task<T> = () => Promise<T>;

class RequestScheduler {
  private queue: Array<() => void> = [];
  private timestamps: number[] = [];
  private readonly windowMs = 1000;
  private readonly limit: number;
  private draining = false;

  constructor(limit = 25) {
    this.limit = limit;
  }

  schedule<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const run = () => {
        task().then(resolve).catch(reject);
      };
      this.queue.push(run);
      this.drain();
    });
  }

  private drain() {
    if (this.draining) return;
    this.draining = true;

    const tick = () => {
      const now = Date.now();
      this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

      while (this.queue.length && this.timestamps.length < this.limit) {
        const run = this.queue.shift()!;
        this.timestamps.push(Date.now());
        run();
      }

      if (this.queue.length) {
        const oldest = this.timestamps[0] ?? now;
        const waitMs = Math.max(0, this.windowMs - (now - oldest));
        setTimeout(tick, waitMs + 5);
      } else {
        this.draining = false;
      }
    };
    tick();
  }
}

export const scheduler = new RequestScheduler(25);
