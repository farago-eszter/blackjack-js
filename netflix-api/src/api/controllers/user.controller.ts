import { Request, Response } from "express";
import { Video, videoRepository } from "../services/video.repository";
import { queueRepository } from "../services/queue.repository";
import { sessionRepository } from "../services/session.repository";

export function getVideos(req: Request, res: Response) {
  const title = req.query.title as string | undefined;
  const videos = videoRepository.findMany(title);

  res.json(videos);
}
export function addVideoToQueue(req: Request, res: Response) {
  const videoId = Number(req.body.videoId);
  try {
    videoRepository.findById(videoId);
  } catch (error: any) {
    res.status(400).json();
    return;
  }
  const userId = req.res!.locals.userId;
  const queue = queueRepository.add(userId, videoId);
  const videos = queue.flatMap((videoId) => findQueuedVideo(userId, videoId));
  res.status(201).json(videos);
}
export function getQueue(req: Request, res: Response) {
  const order = req.query.order;
  const userId = req.res!.locals.userId;
  const queue = queueRepository.get(userId);
  const videos = queue.flatMap((videoId) => findQueuedVideo(userId, videoId));
  if (order === "desc") {
    const descVideos = [...videos].reverse();
    res.json(descVideos);
  } else {
    res.json(videos);
  }
}
export function logout(req: Request, res: Response) {
  const sessionId = req.headers["x-session-id"] as string;
  sessionRepository.delete(sessionId);
  res.json();
}

function findQueuedVideo(userId: number, videoId: number): Video[] {
  try {
    return [videoRepository.findById(videoId)];
  } catch {
    queueRepository.remove(userId, videoId);
    return [];
  }
}
