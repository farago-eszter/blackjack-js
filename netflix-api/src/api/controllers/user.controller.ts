import { NextFunction, Request, Response } from "express";
import { videoRepository } from "../services/video.repository";
import { queueRepository } from "../services/queue.repository";
import { sessionRepository } from "../services/session.repository";

export async function getVideos(req: Request, res: Response) {
  const published = req.res!.locals.userId ? true : undefined;
  const title = req.query.title as string | undefined;
  const videos = await videoRepository.findMany(title, published);
  res.json(videos);
}

export async function addVideoToQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const videoId = req.body.videoId;
    const userId = req.res!.locals.userId;
    const videos = await queueRepository.add(userId, videoId);
    res.status(201).json(videos);
  } catch (err) {
    next(err);
  }
}

export async function getQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const order = String(req.query.order);
    const userId = req.res!.locals.userId;
    if (order === "desc") {
      const videos = await queueRepository.get(userId, order);
      res.json(videos);
    } else {
      const videos = await queueRepository.get(userId, order);
      res.json(videos);
    }
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.headers["x-session-id"] as string;
    await sessionRepository.delete(sessionId);
    res.json();
  } catch (err) {
    next(err);
  }
}
