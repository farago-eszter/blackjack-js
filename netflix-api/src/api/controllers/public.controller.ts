import { Request, Response } from "express";
import { userRepository } from "../services/user.repository";
import { sessionRepository } from "../services/session.repository";
import { queueRepository } from "../services/queue.repository";

export function register(req: Request, res: Response) {
  try {
    const newUser = req.body;
    const createdUser = userRepository.insert(newUser);
    queueRepository.insert(createdUser.id!);
    res.status(201).json(createdUser);
  } catch (err) {
    res.status(409).json();
  }
}

export function login(req: Request, res: Response) {
  const loginCredentials = req.body;
  const user = userRepository.findUserByUsernameAndPassword(loginCredentials.username, loginCredentials.password);
  if (user) {
    const sessionId = sessionRepository.insert(user.id!);
    res.status(201).json(sessionId);
  } else {
    res.status(400).json();
  }
}
