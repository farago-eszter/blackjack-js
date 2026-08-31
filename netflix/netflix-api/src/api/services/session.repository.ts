import { dbApiClient } from "../helpers/db-api-helper";
import { randomUUID } from "crypto";

class SessionRepository {
  async insert(userId: string): Promise<string> {
    const sessionId = this.generateSessionId();
    const body = { userId: userId, sessionId: sessionId };
    const newSession = (await dbApiClient.post("/Session", body)).data;
    return newSession.sessionId;
  }

  generateSessionId(): string {
    return randomUUID();
  }

  async findBySessionId(sessionId: string): Promise<string | undefined> {
    const sessions = (await dbApiClient.get("/Session", { params: { query: { sessionId: sessionId } } })).data;
    return sessions.length ? sessions[0].userId : undefined;
  }

  async delete(sessionId: string): Promise<void> {
    await dbApiClient.delete("/Session", { params: { query: { sessionId } } });
  }

  async deleteAll(): Promise<void> {
    await dbApiClient.delete("/Session");
  }
}

export const sessionRepository = new SessionRepository();
