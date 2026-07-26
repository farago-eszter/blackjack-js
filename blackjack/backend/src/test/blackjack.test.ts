import { Dealer } from "./../classes/dealer";
import { deck, deckUtils } from "./../index";
import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import "../server.js";
import { setGameState, gameState } from "../server.js";
import { BlackjackCard } from "../classes/blackjackCard.js";
import { Player } from "../classes/player";
import { blackjackSettings } from "../gameConfig";
import { Rank, Suit } from "../types/types";

const card = (rank: Rank, suit: Suit = "♣", hidden = false) => new BlackjackCard(rank, suit, hidden);

describe("Blackjack tests", () => {
  const instance = axios.create({
    baseURL: "http://localhost:8000/blackjack",
    validateStatus: undefined,
  });
  beforeEach(() => {
    setGameState({
      player: new Player(),
      dealer: new Dealer(),
      chips: blackjackSettings.startingChips,
      chipsValue: blackjackSettings.startingChips * blackjackSettings.chipValue,
      isRoundActive: false,
    });
  });
  describe("get /new-game", () => {
    it("should return 200", async () => {
      const response = await instance.get("/new-game");

      expect(response.status).to.equal(200);
    });
    it("should return initial game state", async () => {
      const response = await instance.get("/new-game");
      const data = response.data;
      expect(data.player._hand.length).to.equal(0);
      expect(data.player._scores.length).to.equal(0);
      expect(data.dealer._hand.length).to.equal(0);
      expect(data.dealer._scores.length).to.equal(0);
      expect(data.chips).to.equal(10);
      expect(data.chipsValue).to.equal(100);
      expect(data.isRoundActive).to.be.false;
      expect(data.message).to.be.undefined;
    });
  });
  describe("get /new-round", () => {
    it("should return 200", async () => {
      const response = await instance.get("/new-round");

      expect(response.status).to.equal(200);
    });
    it("should return the updated game state when the player does not have blackjack", async () => {
      const shuffleStub = sinon.stub(deckUtils, "shuffle").returns([card("7"), card("7"), card("7"), card("7")]);
      const response = await instance.get("/new-round");
      const data = response.data;
      expect(data.player._hand.length).to.equal(2);
      expect(data.player._scores.length).to.equal(2);
      expect(data.dealer._hand.length).to.equal(2);
      expect(data.dealer._scores.length).to.equal(2);
      expect(data.dealer._hand[1].hidden).to.be.true;
      expect(data.chips).to.equal(9);
      expect(data.chipsValue).to.equal(90);
      expect(data.isRoundActive).to.be.true;
      expect(data.message).to.be.undefined;
      shuffleStub.restore();
    });
    it("should return the updated game state when the player does have blackjack", async () => {
      const shuffleStub = sinon.stub(deckUtils, "shuffle").returns([card("7"), card("K"), card("7"), card("A")]);
      const response = await instance.get("/new-round");
      const data = response.data;
      expect(data.player._hand.length).to.equal(2);
      expect(data.player._scores.length).to.equal(2);
      expect(data.dealer._hand.length).to.equal(2);
      expect(data.dealer._scores.length).to.equal(2);
      expect(data.dealer._hand[1].hidden).to.be.false;
      expect(data.chips).to.equal(12);
      expect(data.chipsValue).to.equal(120);
      expect(data.isRoundActive).to.be.false;
      expect(data.message).to.equal("🎉 Blackjack! You win!");
      shuffleStub.restore();
    });
  });
  describe("get /hit", () => {
    beforeEach(() => {
      const player = new Player();
      player.addCard(card("7"));
      player.addCard(card("7"));
      const dealer = new Dealer();
      dealer.addCard(card("7"));
      dealer.addCard(card("7"));
      deck.push(card("7"));
      setGameState({
        player,
        dealer,
        chips: blackjackSettings.startingChips,
        chipsValue: blackjackSettings.startingChips * blackjackSettings.chipValue,
        isRoundActive: true,
      });
    });
    it("should return 200", async () => {
      const response = await instance.get("/hit");

      expect(response.status).to.equal(200);
    });
    it("should call addCard on player once", async () => {
      const spy = sinon.spy(gameState.player, "addCard");
      await instance.get("/hit");
      expect(spy.calledOnce).to.be.true;
    });
  });
  describe("get /stand", () => {
    beforeEach(() => {
      const player = new Player();
      player.addCard(card("7"));
      player.addCard(card("7"));
      const dealer = new Dealer();
      dealer.addCard(card("7"));
      dealer.addCard(card("7"));
      deck.push(card("7"));
      setGameState({
        player,
        dealer,
        chips: blackjackSettings.startingChips,
        chipsValue: blackjackSettings.startingChips * blackjackSettings.chipValue,
        isRoundActive: true,
      });
    });
    it("should return 200", async () => {
      const response = await instance.get("/stand");

      expect(response.status).to.equal(200);
    });
    it("should draw cards until the dealer has at least 17 points", async () => {
      const response = await instance.get("/stand");
      const scores = response.data.dealer._scores;
      expect(scores[scores.length - 1]).to.be.greaterThanOrEqual(17);
    });
  });
});
