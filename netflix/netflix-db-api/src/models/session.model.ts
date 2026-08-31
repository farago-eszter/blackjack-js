import mongoose, { Schema } from "mongoose";

interface Session {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
}

const sessionSchema = new Schema<Session>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
});

export const SessionModel = mongoose.model<Session>("Session", sessionSchema);
