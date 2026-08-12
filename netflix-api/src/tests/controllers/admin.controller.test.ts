import { Video, videoRepository, VideoType } from "./../../api/services/video.repository";
import { expect } from "chai";
import axios from "axios";
import "../../app";
import { createTestVideo } from "../test-helper";
import { queueRepository } from "../../api/services/queue.repository";
import nock from "nock";

describe("Admin controller", function () {
  const instance = axios.create({
    baseURL: "http://localhost:3000/netflix",
    validateStatus: (status) => {
      return (status >= 200 && status < 300) || status == 404 || status == 401;
    },
  });

  beforeEach(async () => {
    await videoRepository.deleteAll();
  });

  describe("POST /videos", function () {
    const reqBody = {
      title: "Avatar",
      description: "Avatar description",
      imgUrl: "url",
      type: "movie",
      categories: ["Action"],
      releaseYear: 2009,
      published: false,
    };

    it("should return the created video with id when video creation was successful", async () => {
      const response = await instance.post("/videos", reqBody, {
        headers: {
          "X-Admin-API-key": "my-secret-admin-key",
        },
      });
      const createdVideo = response.data;

      expect(response.status).to.equal(201);
      expect(createdVideo.title).to.equal(reqBody.title);
      expect(createdVideo.description).to.equal(reqBody.description);
      expect(createdVideo.imgUrl).to.equal(reqBody.imgUrl);
      expect(createdVideo.type).to.equal(reqBody.type);
      expect(createdVideo.categories).to.deep.equal(reqBody.categories);
      expect(createdVideo.releaseYear).to.equal(reqBody.releaseYear);
      expect(createdVideo.id).to.exist;
    });

    it("should return the created video with id when video creation was successful with mocked db api", async () => {
      const scope = nock("http://localhost:4000/api/v1")
        .post("/Video", reqBody)
        .reply(201, { ...reqBody, _id: "videoId", __v: 1 });

      const response = await instance.post("/videos", reqBody, {
        headers: {
          "X-Admin-API-key": "my-secret-admin-key",
        },
      });
      const createdVideo = response.data;

      expect(response.status).to.equal(201);
      expect(createdVideo.title).to.equal(reqBody.title);
      expect(createdVideo.description).to.equal(reqBody.description);
      expect(createdVideo.imgUrl).to.equal(reqBody.imgUrl);
      expect(createdVideo.type).to.equal(reqBody.type);
      expect(createdVideo.categories).to.deep.equal(reqBody.categories);
      expect(createdVideo.releaseYear).to.equal(reqBody.releaseYear);
      expect(createdVideo.id).to.equal("videoId");
      scope.done();
      nock.cleanAll();
    });

    it("should return 401 Unauthorized if the admin key is invalid", async () => {
      const response = await instance.post("/videos", reqBody, {
        headers: {
          "X-Admin-API-key": "123",
        },
      });
      expect(response.status).to.equal(401);
    });
  });

  describe("PATCH /videos", function () {
    let createdVideo: Video;

    beforeEach(async () => {
      createdVideo = await createTestVideo("Avatar", VideoType.movie, ["Action"], 2009, false);
    });

    it("should return the updated video", async () => {
      const reqBody = {
        releaseYear: 1998,
      };
      const videoToUpdateId = createdVideo.id;
      const response = await instance.patch(`/videos/${videoToUpdateId}`, reqBody, {
        headers: {
          "X-Admin-API-key": "my-secret-admin-key",
        },
      });
      const updatedVideo = response.data;
      expect(response.status).to.equal(200);
      expect(updatedVideo.title).to.equal(createdVideo.title);
      expect(updatedVideo.description).to.equal(createdVideo.description);
      expect(updatedVideo.imgUrl).to.equal(createdVideo.imgUrl);
      expect(updatedVideo.type).to.equal(createdVideo.type);
      expect(updatedVideo.categories).to.deep.equal(createdVideo.categories);
      expect(updatedVideo.releaseYear).to.equal(reqBody.releaseYear);
    });

    it("should return 401 Unauthorized if the admin key is invalid", async () => {
      const reqBody = {
        releaseYear: 1998,
      };
      const videoToUpdateId = createdVideo.id;
      const response = await instance.patch(`/videos/${videoToUpdateId}`, reqBody, {
        headers: {
          "X-Admin-API-key": "123",
        },
      });
      expect(response.status).to.equal(401);
    });

    it("should return 404 when video with id not found", async () => {
      const reqBody = {
        releaseYear: 1998,
      };
      const response = await instance.patch("/videos/100", reqBody, {
        headers: {
          "X-Admin-API-key": "my-secret-admin-key",
        },
      });
      expect(response.status).to.equal(404);
    });
  });

  describe("DELETE /videos", function () {
    let createdVideo: Video;
    const userId = "6a75d532058820a80b90d64c";

    beforeEach(async () => {
      createdVideo = await createTestVideo("Avatar", VideoType.movie, ["Action"], 2009, false);
      await queueRepository.add(userId, createdVideo.id!);
    });

    it("should delete the video", async () => {
      const videoToDeleteId = createdVideo.id;
      const response = await instance.delete(`/videos/${videoToDeleteId}`, {
        headers: {
          "X-Admin-API-key": "my-secret-admin-key",
        },
      });
      expect(response.status).to.equal(204);
    });
    it("should delete the video from all user's queue", async () => {
      const videoToDeleteId = createdVideo.id;
      const queuesBeforeDelete = await queueRepository.getQueuesByVideoId(videoToDeleteId!);
      expect(queuesBeforeDelete).to.have.lengthOf(1);
      const response = await instance.delete(`/videos/${videoToDeleteId}`, {
        headers: {
          "X-Admin-API-key": "my-secret-admin-key",
        },
      });
      const queuesAfterDelete = await queueRepository.getQueuesByVideoId(videoToDeleteId!);
      expect(response.status).to.equal(204);
      expect(queuesAfterDelete).to.have.lengthOf(0);
    });

    it("should return 401 Unauthorized if the admin key is invalid", async () => {
      const videoToDeleteId = createdVideo.id;
      const response = await instance.delete(`/videos/${videoToDeleteId}`, {
        headers: {
          "X-Admin-API-key": "123",
        },
      });
      expect(response.status).to.equal(401);
    });
  });

  describe("GET /videos", function () {
    let video1: Video;
    let video2: Video;
    beforeEach(async () => {
      video1 = await createTestVideo("Avatar", VideoType.movie, ["Action"], 2009, false);
      video2 = await createTestVideo("Breaking Bad", VideoType.tvShow, ["Drama"], 2008, true);
    });
    it("should return all videos when no title filter is provided", async () => {
      const response = await instance.get("/videos", {
        headers: {
          "X-Admin-API-key": "my-secret-admin-key",
        },
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.lengthOf(2);
      expect(response.data).to.deep.equal([video1, video2]);
    });
  });
});
