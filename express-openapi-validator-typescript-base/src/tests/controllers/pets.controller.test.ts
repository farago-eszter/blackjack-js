import { expect } from "chai";
import axios from "axios";
import "../../app";
import { Pet } from "../../api/controllers/pets.controller";

describe("Pets controller", function () {
  const instance = axios.create({
    baseURL: "http://localhost:3000/v1",
    validateStatus: undefined,
  });

  describe("GET /pets", function () {
    it("should return 200.", async () => {
      const response = await instance.get("/pets?type=cat&limit=2");

      expect(response.status).to.equal(200);
    });

    it("should return cats when type parameter is cat", async () => {
      const response = await instance.get("/pets?type=cat&limit=2");
      const pets = response.data;

      expect(pets.some((pet: Pet) => pet.type !== "cat")).to.be.false;
    });

    it("should return only one pet when limit parameter is one", async () => {
      const response = await instance.get("/pets?type=dog&limit=1");

      expect(response.data.length).to.equal(1);
    });
    it("should return pets with tag given in parameter", async () => {
      const response = await instance.get("/pets?type=dog&limit=10&tags=sweet");
      const pets = response.data;

      expect(pets.some((pet: Pet) => !pet.tags.includes("sweet"))).to.be.false;
    });
  });
  describe("POST /pets", function () {
    it("should return 200.", async () => {
      const reqBody = { name: "Nabi", type: "dog" };
      const response = await instance.post("/pets", reqBody);

      expect(response.status).to.equal(200);
    });
    it("should return created pet", async () => {
      const reqBody = { name: "Nabi", type: "dog" };
      const response = await instance.post("/pets", reqBody);
      const createdPet = response.data;
      expect(createdPet.name).to.equal(reqBody.name);
      expect(createdPet.type).to.equal(reqBody.type);
      expect(createdPet.id).to.exist;
    });
  });
  describe("GET /pets/{id}", function () {
    it("should return 200.", async () => {
      const response = await instance.get("/pets/1");

      expect(response.status).to.equal(200);
    });
    it("should return pet with id 1", async () => {
      const response = await instance.get("/pets/1");

      expect(response.data.id).to.equal(1);
    });
    it("should return error when pet does not exist with id", async () => {
      const response = await instance.get("/pets/10");

      expect(response.status).to.equal(404);
      expect(response.data.message).to.equal("not found");
    });
  });
  describe("DELETE /pets/{id}", function () {
    it("should return 204 when pet exists with id", async () => {
      const response = await instance.delete("/pets/1");

      expect(response.status).to.equal(204);
    });
    it("should return 204 when pet does not exist with id", async () => {
      const response = await instance.delete("/pets/10");

      expect(response.status).to.equal(204);
    });
  });
});
