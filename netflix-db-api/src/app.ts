import express, { Application } from "express";
import methodOverride from "method-override";
import mongoose from "mongoose";
import * as restify from "express-restify-mongoose";
import { UserModel } from "./models/user.model";
import { VideoModel } from "./models/video.model";
import { SessionModel } from "./models/session.model";
import { QueueModel } from "./models/queue.model";

const app: Application = express();

app.use(express.json());
app.use(methodOverride());

restify.serve(app, UserModel as any);
restify.serve(app, VideoModel as any);
restify.serve(app, SessionModel as any);
restify.serve(app, QueueModel as any);

async function startServer(): Promise<void> {
  try {
    if (!process.env.MONGO_CONNECTION_STRING) {
      throw new Error("MONGO_CONNECTION_STRING env not provided.");
    }
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);

    console.log("MongoDB connection established");

    app.listen(4000, () => {
      console.log("Express server listening on port 4000");
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
}

startServer();
