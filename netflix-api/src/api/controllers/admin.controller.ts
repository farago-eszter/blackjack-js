import { NextFunction, Request, Response } from "express";
import { videoRepository } from "../services/video.repository";
import { queueRepository } from "../services/queue.repository";

export async function createVideo(req: Request, res: Response, next: NextFunction) {
  try {
    const newVideo = req.body;
    const createdVideo = await videoRepository.insert(newVideo);
    res.status(201).json(createdVideo);
  } catch (err) {
    next(err);
  }
}

export async function updateVideo(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const videoToUpdate = req.body;
    const updatedVideo = await videoRepository.update(id, videoToUpdate);
    res.json(updatedVideo);
  } catch (err) {
    next(err);
  }
}

export async function deleteVideo(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    await videoRepository.delete(id);
    await queueRepository.deleteByVideoId(id);
    res.status(204).json();
  } catch (err) {
    next(err);
  }
}
