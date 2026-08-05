class QueueRepository {
  queues: Map<string, string[]> = new Map();

  insert(userId: string): void {
    this.queues.set(userId, []);
  }

  add(userId: string, videoId: string): string[] {
    if (this.queues.has(userId)) {
      const queue = this.queues.get(userId);
      this.queues.set(userId, [...queue!, videoId]);
      return this.queues.get(userId)!;
    } else {
      throw new Error("Queue does not exist for user: " + userId);
    }
  }

  get(userId: string): string[] {
    if (this.queues.has(userId)) {
      const queue = this.queues.get(userId);
      return queue!;
    } else {
      throw new Error("Queue does not exist for user: " + userId);
    }
  }
  remove(userId: string, videoId: string): string[] {
    let queue = this.queues.get(userId)!;
    queue = queue?.filter((id) => id !== videoId);
    this.queues.set(userId, queue);
    return queue;
  }

  clear(): void {
    this.queues.clear();
  }
}

export const queueRepository = new QueueRepository();
