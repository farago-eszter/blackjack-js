import express, { Application, Request, Response } from "express";
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
    if (
      !process.env.MONGO_USERNAME ||
      !process.env.MONGO_PASSWORD ||
      !process.env.MONGO_HOST ||
      !process.env.MONGO_PORT ||
      !process.env.MONGO_DB_NAME
    ) {
      throw new Error("Env not provided for mongo connection.");
    }
    await mongoose.connect(
      `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}?authSource=admin`,
    );

    console.log("MongoDB connection established");

    app.get("/health", async (req: Request, res: Response) => {
      try {
        await UserModel.countDocuments();
        res.send();
      } catch {
        res.status(500).send();
      }
    });

    app.listen(4000, () => {
      console.log("Express server listening on port 4000");
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
}

startServer();
