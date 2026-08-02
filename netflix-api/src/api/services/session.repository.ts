import { randomUUID } from "crypto";

class SessionRepository {
  sessions: Map<string, number> = new Map();
  insert(userId: number): string {
    const sessionId = this.generateSessionId();
    this.sessions.set(sessionId, userId);
    return sessionId;
  }

  generateSessionId(): string {
    return randomUUID();
  }
  findBySessionId(sessionId: string): number | undefined {
    return this.sessions.get(sessionId);
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
  clear() {
    this.sessions.clear();
  }
}

export const sessionRepository = new SessionRepository();
