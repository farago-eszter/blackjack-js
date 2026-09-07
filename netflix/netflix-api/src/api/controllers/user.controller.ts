import { NextFunction, Request, Response } from "express";
import { videoRepository } from "../services/video.repository";
import { queueRepository } from "../services/queue.repository";
import { deleteApiKeyFromConsumer } from "../services/kong.service";
import { userRepository } from "../services/user.repository";

const usernameHeader = "x-consumer-username";

export async function getVideos(req: Request, res: Response) {
  const sessionId = req.headers["x-session-id"] as string;
  const username = req.headers[usernameHeader] as string;
  const loggedInUserId = await userRepository.getUserIdByUsername(username);
  if (sessionId && loggedInUserId === undefined) {
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
    const username = req.headers[usernameHeader] as string;
    const loggedInUserId = await userRepository.getUserIdByUsername(username);
    if (loggedInUserId === undefined) {
      res.status(401).json();
      return;
    }
    const videoId = req.body.videoId;
    const videos = await queueRepository.add(loggedInUserId, videoId);
    res.status(201).json(videos);
  } catch (err) {
    next(err);
  }
}

export async function getQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const username = req.headers[usernameHeader] as string;
    const loggedInUserId = await userRepository.getUserIdByUsername(username);
    if (loggedInUserId === undefined) {
      res.status(401).json();
      return;
    }
    const order = String(req.query.order);
    const videos = await queueRepository.get(loggedInUserId, order);
    res.json(videos);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.headers["x-session-id"] as string;
    const username = req.headers[usernameHeader] as string;
    const loggedInUserId = await userRepository.getUserIdByUsername(username);
    if (loggedInUserId === undefined) {
      res.status(401).json();
      return;
    }
    await deleteApiKeyFromConsumer(username, sessionId);
    res.json();
  } catch (err) {
    next(err);
  }
}
