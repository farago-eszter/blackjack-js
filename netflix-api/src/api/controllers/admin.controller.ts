import { Request, Response } from "express";
import { videoRepository } from "../services/video.repository";

export function createVideo(req: Request, res: Response) {
  const newVideo = req.body;
  const createdVideo = videoRepository.insert(newVideo);
  res.status(201).json(createdVideo);
}

export function updateVideo(req: Request, res: Response) {
  const id = req.params.id;
  const videoToUpdate = req.body;
  const updatedVideo = videoRepository.update(id, videoToUpdate);
  if (updatedVideo) {
    res.json(updatedVideo);
  } else {
    res.status(404).json();
  }
}

export function deleteVideo(req: Request, res: Response) {
  const id = req.params.id;
  videoRepository.delete(id);
  res.status(204).json();
}
