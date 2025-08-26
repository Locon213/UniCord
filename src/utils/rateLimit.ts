export type Route = string;

type QueueFn<T> = () => Promise<T>;

interface Bucket {
  running: boolean;
  queue: Array<() => Promise<void>>;
}

export class RateLimitManager {
  private buckets = new Map<Route, Bucket>();

  private getBucket(route: Route): Bucket {
    let bucket = this.buckets.get(route);
    if (!bucket) {
      bucket = { running: false, queue: [] };
      this.buckets.set(route, bucket);
    }
    return bucket;
  }

  queue<T>(route: Route, fn: QueueFn<T>): Promise<T> {
    const bucket = this.getBucket(route);
    return new Promise((resolve, reject) => {
      bucket.queue.push(async () => {
        try {
          const res = await fn();
          resolve(res);
        } catch (e) {
          reject(e);
        }
      });
      this.run(bucket);
    });
  }

  private async run(bucket: Bucket) {
    if (bucket.running) return;
    bucket.running = true;
    while (bucket.queue.length) {
      const task = bucket.queue.shift();
      if (task) {
        await task();
      }
    }
    bucket.running = false;
  }
}
