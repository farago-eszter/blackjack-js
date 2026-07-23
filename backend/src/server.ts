import express, { Application, Request, Response } from "express";
import { Dealer } from "./classes/dealer.js";
import { Player } from "./classes/player.js";
import { blackjackSettings } from "./gameConfig.js";
import { GameState } from "./interfaces/gameState.js";
import { deck, drawInitialCards, endRound, getBlackjackResult, prepareRound } from "./index.js";
import path from "path";

export let gameState: GameState;
const PORT = 8000;
const app: Application = express();
const router = express.Router();
app.use(express.json());
app.use("/blackjack", router);
app.listen(PORT, () => console.log(`server connected on port ${PORT}`));
app.use(express.static(path.join(process.cwd(), "./frontend")));
app.use("/assets", express.static(path.join(process.cwd(), "./assets")));
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "./frontend/index.html"));
});

router.get("/new-game", (req: Request, res: Response) => {
  gameState = {
    player: new Player(),
    dealer: new Dealer(),
    chips: blackjackSettings.startingChips,
    chipsValue: blackjackSettings.startingChips * blackjackSettings.chipValue,
    isRoundActive: false,
  };
  res.send(gameState);
});
router.get("/new-round", (req: Request, res: Response) => {
  prepareRound(gameState.player, gameState.dealer);
  drawInitialCards(deck, gameState.player, gameState.dealer);
  let gameResult = getBlackjackResult(gameState.player, gameState.dealer);
  if (gameResult?.blackjack) {
    endRound(gameState.player, gameState.dealer, gameResult);
  }
  res.send(gameState);
});
router.get("/hit", (req: Request, res: Response) => {
  const card = deck.pop()!;
  gameState.player.addCard(card);
  if (gameState.player.isBusted()) {
    endRound(gameState.player, gameState.dealer);
  }
  res.send(gameState);
});
router.get("/stand", (req: Request, res: Response) => {
  gameState.dealer.revealHiddenCard();
  while (gameState.dealer.currentScore() < 17) {
    const card = deck.pop()!;
    gameState.dealer.addCard(card);
  }
  endRound(gameState.player, gameState.dealer);
  res.send(gameState);
});

app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found. Please check the API documentation.",
  });
});
