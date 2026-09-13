import { NextFunction, Request, Response } from "express";
import { userRepository } from "../services/user.repository";
import { hashPassword } from "../helpers/utils";
import { addApiKeyToConsumer, createConsumer } from "../services/kong.service";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const newUser = req.body;
    const createdUser = await userRepository.insert(newUser);
    delete createdUser.password;
    await createConsumer(createdUser.username);
    res.status(201).json(createdUser);
  } catch (err: any) {
    if (err.response && err.response.status === 400 && err.response.data.message.includes("duplicate key error")) {
      res.status(409).send();
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
      const sessionId = await addApiKeyToConsumer(user.username);
      res.status(201).json({ sessionId: sessionId });
    } else {
      res.status(400).json();
    }
  } catch (err) {
    next(err);
  }
}
