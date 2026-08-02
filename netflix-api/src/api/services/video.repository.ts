export interface Video {
  id?: number;
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
  videos: Map<number, Video> = new Map();
  counter: number = 1;

  insert(video: Video): Video {
    const id = this.counter++;
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

  findById(id: number): Video {
    const video = this.videos.get(id);
    if (video) {
      return video;
    } else {
      throw new Error("Video not found.");
    }
  }

  update(id: number, partialVideo: Partial<Video>): Video | undefined {
    const videoToUpdate = this.videos.get(id);
    if (videoToUpdate) {
      return { ...videoToUpdate, ...partialVideo };
    } else {
      return undefined;
    }
  }

  delete(id: number): void {
    this.videos.delete(id);
  }
  clear(): void {
    this.videos.clear();
    this.counter = 1;
  }
}

export const videoRepository = new VideoRepository();
