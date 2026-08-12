import { dbApiClient, mapObjectFromDb } from "../helpers/db-api-helper";
import { Video } from "./video.repository";

interface Queue {
  userId: string;
  videoId: string;
}
class QueueRepository {
  async add(userId: string, videoId: string): Promise<Video[]> {
    const body = { userId, videoId };
    await dbApiClient.post("/Queue", body);
    const queues = (
      await dbApiClient.get("/Queue", {
        params: { query: { userId }, populate: { path: "videoId" } },
      })
    ).data;
    return queues.map((q: any) => mapObjectFromDb(q.videoId));
  }

  async get(userId: string, order?: string): Promise<Video[]> {
    const queues = (
      await dbApiClient.get("/Queue", {
        params: { query: { userId }, populate: { path: "videoId" }, sort: { addedAt: order === "desc" ? -1 : 1 } },
      })
    ).data;
    return queues.map((q: any) => mapObjectFromDb(q.videoId));
  }

  async getQueuesByVideoId(videoId: string): Promise<Queue[]> {
    const queues = (await dbApiClient.get("Queue", { params: { query: { videoId } } })).data;
    return queues.map((q: any) => mapObjectFromDb(q));
  }

  async deleteByVideoId(videoId: string): Promise<void> {
    await dbApiClient.delete("/Queue", { params: { query: { videoId } } });
  }

  async deleteAll(): Promise<void> {
    await dbApiClient.delete("/Queue");
  }
}

export const queueRepository = new QueueRepository();
