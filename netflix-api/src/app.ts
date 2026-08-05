import express, { Application, NextFunction, Request, Response } from "express";
import path from "path";
import logger from "morgan";
import http from "http";
import * as OpenApiValidator from "express-openapi-validator";
import { sessionRepository } from "./api/services/session.repository";

const port = 3000;
const app: Application = express();
const apiSpec = path.join(__dirname, "/api/swagger/api.yaml");

// 1. Install bodyParsers for the request types your API will support
app.use(express.urlencoded({ extended: false }));
app.use(express.text());
app.use(express.json());

app.use(logger("combined"));
app.use("/spec", express.static(apiSpec));

// 2. Add the OpenApiValidator middleware
app.use(
  OpenApiValidator.middleware({
    apiSpec,
    // 3. Provide the path to the controllers directory
    operationHandlers: path.join(__dirname), // default false
    validateRequests: true,
    validateResponses: true,
    validateSecurity: {
      handlers: {
        userSecurity: (req: Request) => {
          const sessionId = req.headers["x-session-id"];
          const userId = sessionRepository.findBySessionId(sessionId as string);
          req.res!.locals.userId = userId;
          return !!userId;
        },
        adminSecurity: (req: Request) => {
          const adminKey = req.headers["x-admin-api-key"];
          return adminKey === "my-secret-admin-key";
        },
      },
    },
  }),
);

// 4. Add an error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // format errors
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

http.createServer(app).listen(port);
console.log(`Listening on port ${port}`);

// for testing purposes
module.exports = app;
