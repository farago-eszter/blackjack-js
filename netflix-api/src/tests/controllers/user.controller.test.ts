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
    validateStatus: (status) => {
      return (status >= 200 && status < 300) || status == 401 || status == 400;
    },
  });

  beforeEach(async () => {
    await videoRepository.deleteAll();
    await sessionRepository.deleteAll();
    await queueRepository.deleteAll();
    await userRepository.deleteAll();
  });

  describe("GET /videos", () => {
    let video1: Video;
    let video2: Video;
    let video3: Video;
    let sessionId: string;

    beforeEach(async () => {
      video1 = await createTestVideo("Avatar", VideoType.movie, ["Action"], 2009, true);

      video2 = await createTestVideo("Breaking Bad", VideoType.tvShow, ["Drama"], 2008, false);
      video3 = await createTestVideo("Tha Maze Runner", VideoType.movie, ["Action"], 2014, true);

      sessionId = (await createAuthenticatedUser()).sessionId;
    });

    it("should return all published videos when no title filter is provided", async () => {
      const response = await instance.get("/videos", {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(2);
      expect(response.data).to.deep.equal([video1, video3]);
    });

    it("should return published videos matching the provided title", async () => {
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

    beforeEach(async () => {
      video1 = await createTestVideo("Avatar", VideoType.movie, ["Action"], 2009, true);
      ({ sessionId } = await createAuthenticatedUser());
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
      const reqBody = { videoId: "videoid" };
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
  });

  describe("GET /queue", () => {
    let video1: Video;
    let video2: Video;
    let sessionId: string;
    let userId: string;

    beforeEach(async () => {
      video1 = await createTestVideo("Avatar", VideoType.movie, ["Action"], 2009, true);

      video2 = await createTestVideo("Breaking Bad", VideoType.tvShow, ["Drama"], 2008, true);

      ({ sessionId, userId } = await createAuthenticatedUser());
      await queueRepository.add(userId, video1.id!);
      await queueRepository.add(userId, video2.id!);
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
  });

  describe("POST /user/logout", () => {
    it("should delete the session and return 200 OK", async () => {
      const sessionId = (await createAuthenticatedUser()).sessionId;

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
      expect(await sessionRepository.findBySessionId(sessionId)).to.be.undefined;
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
