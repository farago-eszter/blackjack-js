import mongoose, { Schema } from "mongoose";

interface Video {
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

const videoSchema = new Schema<Video>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(VideoType),
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  releaseYear: {
    type: Number,
    required: true,
  },
  published: {
    type: Boolean,
    required: true,
  },
});

export const VideoModel = mongoose.model<Video>("Video", videoSchema);
