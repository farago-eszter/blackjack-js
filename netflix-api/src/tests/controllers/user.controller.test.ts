import { expect } from "chai";
import axios from "axios";
import "../../app";
import { Video, videoRepository, VideoType } from "../../api/services/video.repository";
import { sessionRepository } from "../../api/services/session.repository";
import { queueRepository } from "../../api/services/queue.repository";
import { userRepository } from "../../api/services/user.repository";
import { createAuthenticatedUser, createTestVideo } from "../test-helper";

describe("User controller", function () {
  const instance = axios.create({
    baseURL: "http://localhost:3000/netflix",
    validateStatus: undefined,
  });
  beforeEach(() => {
    videoRepository.clear();
    sessionRepository.clear();
    queueRepository.clear();
    userRepository.clear();
  });

  describe("GET /videos", () => {
    let video1: Video;
    let video2: Video;
    let sessionId: string;
    beforeEach(() => {
      video1 = createTestVideo("Avatar", VideoType.movie, ["Action"], 2009);

      video2 = createTestVideo("Breaking Bad", VideoType.tvShow, ["Drama"], 2008);

      sessionId = createAuthenticatedUser().sessionId;
    });

    it("should return all videos when no title filter is provided", async () => {
      const response = await instance.get("/videos", {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(2);
      expect(response.data).to.deep.equal([video1, video2]);
    });

    it("should return videos matching the provided title", async () => {
      const response = await instance.get("/videos?title=avatar", {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(1);
      expect(response.data).to.deep.equal([video1]);
    });

    it("should return 401 Unauthorized if the session ID is invalid", async () => {
      const response = await instance.get("/videos", {
        headers: {
          "X-Session-ID": "123",
        },
      });
      expect(response.status).to.equal(401);
    });
  });
  describe("POST /queue", () => {
    let video1: Video;
    let sessionId: string;
    let userId: number;
    beforeEach(() => {
      video1 = createTestVideo("Avatar", VideoType.movie, ["Action"], 2009);
      ({ sessionId, userId } = createAuthenticatedUser());
      queueRepository.insert(userId);
    });
    it("should add the video to the authenticated user's queue", async () => {
      const reqBody = { videoId: video1.id };
      const response = await instance.post("/queue", reqBody, {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      expect(response.status).to.equal(201);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(1);
      expect(response.data).to.deep.equal([video1]);
    });
    it("should return 400 if the video with id is not found", async () => {
      const reqBody = { videoId: 3 };
      const response = await instance.post("/queue", reqBody, {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      expect(response.status).to.equal(400);
    });
    it("should return 401 Unauthorized if the session ID is invalid", async () => {
      const reqBody = { videoId: video1.id };
      const response = await instance.post("/queue", reqBody, {
        headers: {
          "X-Session-ID": "123",
        },
      });
      expect(response.status).to.equal(401);
    });
    it("should return 500 if the user does not have queue", async () => {
      queueRepository.clear();
      const reqBody = { videoId: video1.id };
      const response = await instance.post("/queue", reqBody, {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      expect(response.status).to.equal(500);
    });
  });
  describe("GET /queue", () => {
    let video1: Video;
    let video2: Video;
    let sessionId: string;
    let userId: number;
    beforeEach(() => {
      video1 = createTestVideo("Avatar", VideoType.movie, ["Action"], 2009);

      video2 = createTestVideo("Breaking Bad", VideoType.tvShow, ["Drama"], 2008);

      ({ sessionId, userId } = createAuthenticatedUser());
      queueRepository.insert(userId);
      queueRepository.add(userId, video1.id!);
      queueRepository.add(userId, video2.id!);
    });
    it("should return the queue of the authenticated user", async () => {
      const response = await instance.get("/queue", {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(2);
      expect(response.data).to.deep.equal([video1, video2]);
    });
    it("should remove the video from the queue when the video with the given ID does not exist anymore", async () => {
      queueRepository.add(userId, 10);
      const queueLengthBeforeCall = queueRepository.get(userId);
      expect(queueLengthBeforeCall).to.have.lengthOf(3);
      const response = await instance.get("/queue", {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      const queueLengthAfterCall = queueRepository.get(userId);
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(2);
      expect(queueLengthAfterCall).to.have.lengthOf(2);
    });
    it("should return the authenticated user's queue in descending order", async () => {
      const response = await instance.get("/queue?order=desc", {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(2);
      expect(response.data).to.deep.equal([video2, video1]);
    });
    it("should return 401 Unauthorized if the session ID is invalid", async () => {
      const response = await instance.get("/queue", {
        headers: {
          "X-Session-ID": "123",
        },
      });
      expect(response.status).to.equal(401);
    });
    it("should return 500 if the user does not have queue", async () => {
      queueRepository.clear();
      const response = await instance.get("/queue", {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      expect(response.status).to.equal(500);
    });
  });
  describe("POST /user/logout", () => {
    it("should delete the session and return 200 OK", async () => {
      const sessionId = createAuthenticatedUser().sessionId;

      const response = await instance.post(
        "/user/logout",
        {},
        {
          headers: {
            "X-Session-ID": sessionId,
          },
        },
      );
      expect(response.status).to.equal(200);
      expect(response.data).to.be.empty;
      expect(sessionRepository.findBySessionId(sessionId)).to.be.undefined;
    });
    it("should return 401 Unauthorized if the session ID is invalid", async () => {
      const response = await instance.post(
        "/user/logout",
        {},
        {
          headers: {
            "X-Session-ID": "123",
          },
        },
      );
      expect(response.status).to.equal(401);
    });
  });
});
