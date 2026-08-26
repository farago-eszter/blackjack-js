import { expect } from "chai";
import axios from "axios";
import "../../app";
import { userRepository } from "../../api/services/user.repository";
import sinon from "sinon";
import nock from "nock";

describe("Public controller", function () {
  const instance = axios.create({
    baseURL: "http://localhost:3000/netflix",
    validateStatus: (status) => {
      return (status >= 200 && status < 300) || status == 400 || status == 409;
    },
  });

  beforeEach(async () => {
    await userRepository.deleteAll();
  });

  describe("POST /user", function () {
    it("should return the created user with id", async () => {
      const reqBody = {
        username: "valaki",
        firstName: "Valaki",
        lastName: "Nagy",
        email: "valaki.nagy@gmail.com",
        password: "password",
      };
      const consumerReqBody = { username: reqBody.username, tags: ["user"] };
      const aclReqBody = { group: "users" };
      const consumerNock = nock(process.env.KONG_ADMIN_API_URL!).post("/consumers", consumerReqBody).reply(201);
      const aclNock = nock(process.env.KONG_ADMIN_API_URL!)
        .post(`/consumers/${reqBody.username}/acls`, aclReqBody)
        .reply(201);

      const response = await instance.post("/user", reqBody);
      const createdUser = response.data;
      expect(response.status).to.equal(201);
      expect(createdUser.username).to.equal(reqBody.username);
      expect(createdUser.firstName).to.equal(reqBody.firstName);
      expect(createdUser.lastName).to.equal(reqBody.lastName);
      expect(createdUser.email).to.equal(reqBody.email);
      expect(createdUser.password).to.not.exist;
      expect(createdUser.id).to.exist;
      consumerNock.done();
      aclNock.done();
      nock.cleanAll();
    });

    it("should return 409 Conflict if the username is already in use", async () => {
      const existingUser = {
        username: "valaki",
        firstName: "Másvalaki",
        lastName: "Nagy",
        email: "másvalaki.nagy@gmail.com",
        password: "password",
      };
      await userRepository.insert(existingUser);
      const reqBody = {
        username: "valaki",
        firstName: "Valaki",
        lastName: "Nagy",
        email: "valaki.nagy@gmail.com",
        password: "password",
      };
      const response = await instance.post("/user", reqBody, {
        validateStatus: () => true,
      });
      expect(response.status).to.equal(409);
    });

    it("should return 409 Conflict if the email is already in use", async () => {
      const existingUser = {
        username: "másvalaki",
        firstName: "Másvalaki",
        lastName: "Nagy",
        email: "valaki.nagy@gmail.com",
        password: "password",
      };
      await userRepository.insert(existingUser);
      const reqBody = {
        username: "valaki",
        firstName: "Valaki",
        lastName: "Nagy",
        email: "valaki.nagy@gmail.com",
        password: "password",
      };
      const response = await instance.post("/user", reqBody, {
        validateStatus: () => true,
      });

      expect(response.status).to.equal(409);
    });
  });

  describe("POST /user/login", () => {
    it("should return a session ID when the credentials are valid", async () => {
      const user = await userRepository.insert({
        username: "valaki",
        firstName: "Valaki",
        lastName: "Nagy",
        email: "valaki.nagy@gmail.com",
        password: "password",
      });
      const consumerCredentialNock = nock(process.env.KONG_ADMIN_API_URL!)
        .post(`/consumers/${user.username}/key-auth`)
        .reply(201, { key: "sessionId" });
      const credentials = { username: "valaki", password: "password" };
      const response = await instance.post("/user/login", credentials);
      const sessionId = response.data.sessionId;
      expect(response.status).to.equal(201);
      expect(sessionId).to.exist;
      expect(sessionId).to.be.a("string");
      expect(sessionId).to.be.not.empty;
      expect(sessionId).to.equal("sessionId");
      consumerCredentialNock.done();
      nock.cleanAll();
    });

    it("should return 400 Bad Request if the username is invalid", async () => {
      await userRepository.insert({
        username: "valaki",
        firstName: "Valaki",
        lastName: "Nagy",
        email: "valaki.nagy@gmail.com",
        password: "password",
      });
      const credentials = { username: "valakimás", password: "password" };
      const response = await instance.post("/user/login", credentials);
      expect(response.status).to.equal(400);
    });

    it("should return 400 Bad Request if the password is invalid", async () => {
      await userRepository.insert({
        username: "valaki",
        firstName: "Valaki",
        lastName: "Nagy",
        email: "valaki.nagy@gmail.com",
        password: "password",
      });
      const credentials = { username: "valaki", password: "password2" };
      const response = await instance.post("/user/login", credentials);
      expect(response.status).to.equal(400);
    });

    it("should return 400 Bad Request if user is not found", async () => {
      const findUserByUsernameAndPasswordStub = sinon
        .stub(userRepository, "findUserByUsernameAndPassword")
        .resolves(undefined);
      const credentials = { username: "valakimás", password: "password" };
      const response = await instance.post("/user/login", credentials);
      expect(response.status).to.equal(400);
      findUserByUsernameAndPasswordStub.restore();
    });
  });
});
