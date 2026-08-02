import { Video, videoRepository, VideoType } from "./../../api/services/video.repository";
import { expect } from "chai";
import axios from "axios";
import "../../app";
import { createTestVideo } from "../test-helper";

describe("Admin controller", function () {
  const instance = axios.create({
    baseURL: "http://localhost:3000/netflix",
    validateStatus: undefined,
  });
  beforeEach(() => {
    videoRepository.clear();
  });
  describe("POST /videos", function () {
    const reqBody = {
      title: "Avatar",
      description: "Avatar description",
      imgUrl: "url",
      type: "movie",
      categories: ["Action"],
      releaseYear: 2009,
    };
    it("should return the created video with id", async () => {
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
    beforeEach(() => {
      createdVideo = createTestVideo("Avatar", VideoType.movie, ["Action"], 2009);
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
    beforeEach(() => {
      createdVideo = createTestVideo("Avatar", VideoType.movie, ["Action"], 2009);
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
    beforeEach(() => {
      video1 = createTestVideo("Avatar", VideoType.movie, ["Action"], 2009);
      video2 = createTestVideo("Breaking Bad", VideoType.tvShow, ["Drama"], 2008);
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
