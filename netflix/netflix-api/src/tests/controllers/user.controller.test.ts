import { expect } from "chai";
import axios from "axios";
import "../../app";
import { Video, videoRepository, VideoType } from "../../api/services/video.repository";
import { queueRepository } from "../../api/services/queue.repository";
import { userRepository } from "../../api/services/user.repository";
import { createAuthenticatedUser, createTestVideo } from "../test-helper";
import nock from "nock";

describe("User controller", function () {
  const instance = axios.create({
    baseURL: "http://localhost:3000/netflix",
    validateStatus: (status) => {
      return (status >= 200 && status < 300) || status == 401 || status == 400;
    },
  });

  beforeEach(async () => {
    await videoRepository.deleteAll();
    await queueRepository.deleteAll();
    await userRepository.deleteAll();
  });

  describe("GET /videos", () => {
    let video1: Video;
    let video2: Video;
    let video3: Video;
    let username: string;

    beforeEach(async () => {
      video1 = await createTestVideo("Avatar", VideoType.movie, ["Action"], 2009, true);

      video2 = await createTestVideo("Breaking Bad", VideoType.tvShow, ["Drama"], 2008, false);
      video3 = await createTestVideo("Tha Maze Runner", VideoType.movie, ["Action"], 2014, true);

      ({ username } = await createAuthenticatedUser());
    });

    it("should return all published videos when no title filter is provided", async () => {
      const response = await instance.get("/videos", {
        headers: {
          "X-Session-ID": "sessionId",
          "X-Consumer-Username": username,
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
          "X-Session-ID": "sessionId",
          "X-Consumer-Username": username,
        },
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(1);
      expect(response.data).to.deep.equal([video1]);
    });
  });

  describe("POST /queue/add", () => {
    let video1: Video;
    let username: string;
    let userId: string;

    beforeEach(async () => {
      video1 = await createTestVideo("Avatar", VideoType.movie, ["Action"], 2009, true);
      ({ userId, username } = await createAuthenticatedUser());
    });

    it("should add the video to the authenticated user's queue", async () => {
      const reqBody = { videoId: video1.id };
      const response = await instance.post("/queue/add", reqBody, {
        headers: {
          "X-Session-ID": "sessionId",
          "X-Consumer-Username": username,
        },
      });
      expect(response.status).to.equal(201);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(1);
      expect(response.data).to.deep.equal([video1]);
    });

    it("should return 400 if the video with id is already in queue", async () => {
      const reqBody = { videoId: video1.id };
      queueRepository.add(userId, video1.id!);
      const response = await instance.post("/queue/add", reqBody, {
        headers: {
          "X-Session-ID": "sessionId",
          "X-Consumer-Username": username,
        },
      });
      expect(response.status).to.equal(400);
    });

    it("should return 400 if the video with id is not found", async () => {
      const reqBody = { videoId: "videoid" };
      const response = await instance.post("/queue/add", reqBody, {
        headers: {
          "X-Session-ID": "sessionId",
          "X-Consumer-Username": username,
        },
      });
      expect(response.status).to.equal(400);
    });
  });

  describe("GET /queue/items", () => {
    let video1: Video;
    let video2: Video;
    let username: string;
    let userId: string;

    beforeEach(async () => {
      video1 = await createTestVideo("Avatar", VideoType.movie, ["Action"], 2009, true);

      video2 = await createTestVideo("Breaking Bad", VideoType.tvShow, ["Drama"], 2008, true);

      ({ userId, username } = await createAuthenticatedUser());
      await queueRepository.add(userId, video1.id!);
      await queueRepository.add(userId, video2.id!);
    });

    it("should return the queue of the authenticated user", async () => {
      const response = await instance.get("/queue/items", {
        headers: {
          "X-Session-ID": "sessionId",
          "X-Consumer-Username": username,
        },
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(2);
      expect(response.data).to.deep.equal([video1, video2]);
    });

    it("should return the authenticated user's queue in descending order", async () => {
      const response = await instance.get("/queue/items?order=desc", {
        headers: {
          "X-Session-ID": "sessionId",
          "X-Consumer-Username": username,
        },
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(2);
      expect(response.data).to.deep.equal([video2, video1]);
    });
  });

  describe("POST /user/logout", () => {
    it("should delete the session and return 200 OK", async () => {
      const username = (await createAuthenticatedUser()).username;
      const consumerCredentialNock = nock(process.env.KONG_ADMIN_API_URL!)
        .delete(`/consumers/${username}/key-auth/sessionId`)
        .reply(200);
      const response = await instance.post(
        "/user/logout",
        {},
        {
          headers: {
            "X-Session-ID": "sessionId",
            "X-Consumer-Username": username,
          },
        },
      );
      expect(response.status).to.equal(200);
      expect(response.data).to.be.empty;
      consumerCredentialNock.done();
      nock.cleanAll();
    });
  });
});
