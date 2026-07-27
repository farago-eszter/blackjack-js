import { expect } from "chai";
import axios from "axios";
import "../../app";
import { Pet, pets } from "../../api/controllers/pets.controller";

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
      const response = await instance.get("/pets?type=cat&limit=10");
      const pets = response.data;

      expect(pets.every((pet: Pet) => pet.type === "cat")).to.be.true;
    });

    it("should return only one pet when limit parameter is one", async () => {
      expect(pets.filter((pet) => pet.type === "dog").length).to.be.greaterThan(1);
      const response = await instance.get("/pets?type=dog&limit=1");

      expect(response.data.length).to.equal(1);
    });
    it("should return pets containing all given tags", async () => {
      const response = await instance.get("/pets?type=dog&limit=10&tags=sweet&tags=purrfect");
      const pets = response.data;
      const tags = ["sweet", "purrfect"];

      expect(pets.every((pet: Pet) => tags.every((tag) => pet.tags.includes(tag)))).to.be.true;
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
