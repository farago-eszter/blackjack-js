import mongoose, { Schema } from "mongoose";

interface Queue {
  userId: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
}

const queueSchema = new Schema<Queue>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    videoId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Video",
    },
  },
  {
    timestamps: {
      createdAt: "addedAt",
      updatedAt: false,
    },
  },
);

export const QueueModel = mongoose.model<Queue>("Queue", queueSchema);
