import { NextFunction, Request, Response } from "express";
import { videoRepository } from "../services/video.repository";
import { queueRepository } from "../services/queue.repository";
import { deleteApiKeyFromConsumer } from "../services/kong.service";
import { userRepository } from "../services/user.repository";

export async function getVideos(req: Request, res: Response) {
  const sessionId = req.headers["x-session-id"] as string;
  const username = req.headers["x-consumer-username"] as string;
  const validUserId = await userRepository.getUserIdByUsername(username);
  if (sessionId && validUserId === undefined) {
    res.status(401).json();
    return;
  }
  const isFilteredByPublished = !!sessionId;
  const title = req.query.title as string | undefined;
  const videos = await videoRepository.findMany(title, isFilteredByPublished);
  res.json(videos);
}

export async function addVideoToQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const username = req.headers["x-consumer-username"] as string;
    const validUserId = await userRepository.getUserIdByUsername(username);
    if (validUserId === undefined) {
      res.status(401).json();
      return;
    }
    const videoId = req.body.videoId;
    const videos = await queueRepository.add(validUserId, videoId);
    res.status(201).json(videos);
  } catch (err) {
    next(err);
  }
}

export async function getQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const username = req.headers["x-consumer-username"] as string;
    const validUserId = await userRepository.getUserIdByUsername(username);
    if (validUserId === undefined) {
      res.status(401).json();
      return;
    }
    const order = String(req.query.order);
    const videos = await queueRepository.get(validUserId, order);
    res.json(videos);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.headers["x-session-id"] as string;
    const username = req.headers["x-consumer-username"] as string;
    const validUserId = await userRepository.getUserIdByUsername(username);
    if (validUserId === undefined) {
      res.status(401).json();
      return;
    }
    await deleteApiKeyFromConsumer(username, sessionId);
    res.json();
  } catch (err) {
    next(err);
  }
}
