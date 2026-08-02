class QueueRepository {
  queues: Map<number, number[]> = new Map();

  insert(userId: number): void {
    this.queues.set(userId, []);
  }

  add(userId: number, videoId: number): number[] {
    if (this.queues.has(userId)) {
      const queue = this.queues.get(userId);
      this.queues.set(userId, [...queue!, videoId]);
      return this.queues.get(userId)!;
    } else {
      throw new Error("Queue does not exist for user: " + userId);
    }
  }

  get(userId: number): number[] {
    if (this.queues.has(userId)) {
      const queue = this.queues.get(userId);
      return queue!;
    } else {
      throw new Error("Queue does not exist for user: " + userId);
    }
  }
  remove(userId: number, videoId: number): number[] {
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
