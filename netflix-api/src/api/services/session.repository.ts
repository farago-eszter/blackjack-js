import { randomUUID } from "crypto";

class SessionRepository {
  sessions: Map<string, string[]> = new Map();
  insert(userId: string): string {
    const sessionId = this.generateSessionId();
    if (this.sessions.has(userId)) {
      const userSessions = this.sessions.get(userId)!;
      userSessions.push(sessionId);
      this.sessions.set(userId, userSessions);
    } else {
      this.sessions.set(userId, [sessionId]);
    }
    return sessionId;
  }

  generateSessionId(): string {
    return randomUUID();
  }

  findBySessionId(sessionId: string): string | undefined {
    for (const [userId, sessionIds] of this.sessions.entries()) {
      if (sessionIds.includes(sessionId)) {
        return userId;
      }
    }
    return undefined;
  }

  delete(sessionId: string): void {
    for (const [userId, sessionIds] of this.sessions.entries()) {
      const index = sessionIds.indexOf(sessionId);
      if (index !== -1) {
        sessionIds.splice(index, 1);
        if (sessionIds.length === 0) {
          this.sessions.delete(userId);
        } else {
          this.sessions.set(userId, sessionIds);
        }
        return;
      }
    }
  }
  clear() {
    this.sessions.clear();
  }
}

export const sessionRepository = new SessionRepository();
