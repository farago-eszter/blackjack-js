import { dbApiClient, mapObjectFromDb } from "../helpers/db-api-helper";

export interface Video {
  id?: string;
  title: string;
  description: string;
  imgUrl: string;
  type: VideoType;
  categories: string[];
  releaseYear: number;
  published: boolean;
}
export enum VideoType {
  tvShow = "tv show",
  movie = "movie",
}

class VideoRepository {
  async insert(video: Video): Promise<Video> {
    const createdVideo = (await dbApiClient.post("/Video", video)).data;
    const newVideo = mapObjectFromDb(createdVideo);
    return newVideo;
  }

  async findMany(title?: string, published?: boolean): Promise<Video[]> {
    if (title) {
      const videos = (
        await dbApiClient.get("/Video", {
          params: {
            query: {
              title: {
                $regex: title,
                $options: "i",
              },
              published: published,
            },
          },
        })
      ).data;
      return videos.map((video: any) => mapObjectFromDb(video));
    } else {
      const videos = (await dbApiClient.get("/Video", { params: { query: { published: published } } })).data;
      return videos.map((video: any) => mapObjectFromDb(video));
    }
  }

  async update(id: string, partialVideo: Partial<Video>): Promise<Video> {
    const updatedVideo = (await dbApiClient.patch(`/Video/${id}`, partialVideo)).data;
    return mapObjectFromDb(updatedVideo);
  }

  async delete(id: string): Promise<void> {
    await dbApiClient.delete(`/Video/${id}`);
  }

  async deleteAll(): Promise<void> {
    await dbApiClient.delete("/Video");
  }
}

export const videoRepository = new VideoRepository();
