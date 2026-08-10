import { NextFunction, Request, Response } from "express";
import { userRepository } from "../services/user.repository";
import { sessionRepository } from "../services/session.repository";
import { hashPassword } from "../helpers/password-helper";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const newUser = req.body;
    const createdUser = await userRepository.insert(newUser);
    delete createdUser.password;
    res.status(201).json(createdUser);
  } catch (err: any) {
    if (err.response.status === 400 && err.response.data.message.includes("duplicate key error")) {
      res.status(409).json();
    } else {
      next(err);
    }
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const loginCredentials = req.body;

    const user = await userRepository.findUserByUsernameAndPassword(
      loginCredentials.username,
      hashPassword(loginCredentials.password),
    );
    if (user) {
      const sessionId = await sessionRepository.insert(user.id!);
      res.status(201).json({ sessionId: sessionId });
    } else {
      res.status(400).json();
    }
  } catch (err) {
    next(err);
  }
}
