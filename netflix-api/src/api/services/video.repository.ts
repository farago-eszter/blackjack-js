import { utils } from "../helpers/utils";

export interface Video {
  id?: string;
  title: string;
  description: string;
  imgUrl: string;
  type: VideoType;
  categories: string[];
  releaseYear: number;
}
export enum VideoType {
  tvShow = "tv show",
  movie = "movie",
}

class VideoRepository {
  videos: Map<string, Video> = new Map();

  insert(video: Video): Video {
    const id = utils.generateId();
    const newVideo = { id, ...video };
    this.videos.set(id, newVideo);
    return newVideo;
  }

  findMany(title?: string): Video[] {
    if (title) {
      return [...this.videos.values()].filter((video) =>
        video.title.toLocaleLowerCase().includes(title.toLocaleLowerCase()),
      );
    } else {
      return [...this.videos.values()];
    }
  }

  findById(id: string): Video {
    const video = this.videos.get(id);
    if (video) {
      return video;
    } else {
      throw new Error("Video not found.");
    }
  }

  update(id: string, partialVideo: Partial<Video>): Video | undefined {
    const videoToUpdate = this.videos.get(id);
    if (videoToUpdate) {
      return { ...videoToUpdate, ...partialVideo };
    } else {
      return undefined;
    }
  }

  delete(id: string): void {
    this.videos.delete(id);
  }
  clear(): void {
    this.videos.clear();
  }
}

export const videoRepository = new VideoRepository();
