import { Dealer } from "./classes/dealer.js";
import { Player } from "./classes/player.js";
import { BlackjackCard } from "./classes/blackjackCard.js";
import { GameResult } from "./interfaces/gameResult.js";
import { suits, ranks, messages, Winner, Message } from "./types/types.js";
import { blackjackSettings } from "./gameConfig.js";

const dealerCardsElement = document.getElementById("dealerCards") as HTMLDivElement;
const playerCardsElement = document.getElementById("playerCards") as HTMLDivElement;
const gameMessageElement = document.getElementById("gameMessage") as HTMLHeadingElement;
const dealerScoreElement = document.getElementsByTagName("h1")[1] as HTMLHeadingElement;
const playerScoreElement = document.getElementsByTagName("h1")[3] as HTMLHeadingElement;
const startButtonContainerElement = document.getElementsByClassName("start-button")[0] as HTMLDivElement;
const gameButtonsContainerElement = document.getElementsByClassName("game-buttons")[0] as HTMLDivElement;
const hitButtonElement = document.getElementById("hit") as HTMLButtonElement;
const standButtonElement = document.getElementById("stand") as HTMLButtonElement;
const startButtonElement = document.getElementById("start") as HTMLButtonElement;
const betContainerElement = document.getElementsByClassName("bet-container")[0] as HTMLDivElement;
const chipsValueElement = document.getElementById("chipsValue") as HTMLHeadingElement;
let chips = blackjackSettings.startingChips;
let chipsValue = chips * blackjackSettings.chipValue;
let deck: BlackjackCard[] = [];
startButtonElement.onclick = startRound;

async function startRound(): Promise<void> {
  const player = new Player(playerCardsElement, playerScoreElement);
  const dealer = new Dealer(dealerCardsElement, dealerScoreElement);
  deck = createDeck();
  deck = shuffle(deck);
  chips -= blackjackSettings.bet;
  chipsValue = chips * blackjackSettings.chipValue;
  dealer.cardsElement.innerHTML = "";
  player.cardsElement.innerHTML = "";
  gameMessageElement.textContent = "";
  showBet();
  await drawInitialCards(deck, player, dealer);
  showGameButtons();
  let gameResult = getBlackjackResult(player, dealer);
  if (gameResult?.blackjack) {
    endRound(player, dealer, gameResult);
  }
  hitButtonElement.onclick = async () => {
    await hit(player, dealer, gameResult);
  };
  standButtonElement.onclick = async () => {
    await stand(player, dealer, gameResult);
  };
}

function createDeck(): BlackjackCard[] {
  const deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push(new BlackjackCard(rank, suit, false));
    }
  }
  return deck;
}

function shuffle(deck: BlackjackCard[]): BlackjackCard[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

async function drawInitialCards(deck: BlackjackCard[], player: Player, dealer: Dealer): Promise<void> {
  let playerScore: number;
  let dealerScore: number;
  let card: BlackjackCard;
  playerScore = player.getScore();
  player.updateScoreElement(playerScore);
  dealerScore = dealer.getScore();
  dealer.updateScoreElement(dealerScore);
  card = deck.pop()!;
  player.addCard(card);
  await player.addCardElement(card);
  playerScore = player.getScore();
  player.updateScoreElement(playerScore);
  card = deck.pop()!;
  dealer.addCard(card);
  await dealer.addCardElement(card);
  dealerScore = dealer.getScore();
  dealer.updateScoreElement(dealerScore);
  card = deck.pop()!;
  player.addCard(card);
  await player.addCardElement(card);
  playerScore = player.getScore();
  player.updateScoreElement(playerScore);
  card = deck.pop()!;
  card.hidden = true;
  dealer.addCard(card);
  await dealer.addCardElement(card);
  dealerScore = dealer.getScore();
  dealer.updateScoreElement(dealerScore);
}

function showStartButton(): void {
  startButtonContainerElement.style.display = "block";
  gameButtonsContainerElement.style.display = "none";
  betContainerElement.style.display = "none";
}
function showGameButtons(): void {
  startButtonContainerElement.style.display = "none";
  gameButtonsContainerElement.style.display = "flex";
}

function showBet(): void {
  betContainerElement.style.display = "flex";
  chipsValueElement.textContent = chipsValue + "$";
}

function getBlackjackResult(player: Player, dealer: Dealer): GameResult | undefined {
  let result: GameResult | undefined;
  if (isBlackjack(player)) {
    if (isBlackjack(dealer, true)) {
      result = { winner: Winner.Tie, blackjack: true };
    } else {
      result = { winner: Winner.Player, blackjack: true };
    }
  }
  return result;
}

function isBlackjack(participant: Player | Dealer, includeHiddenCards = false): boolean {
  return participant.getScore(includeHiddenCards) === blackjackSettings.blackjackScore && participant.hand.length === 2;
}

async function hit(player: Player, dealer: Dealer, gameResult?: GameResult): Promise<void> {
  hitButtonElement.disabled = true;
  const card = deck.pop()!;
  player.addCard(card);
  await player.addCardElement(card);
  const playerScore = player.getScore();
  player.updateScoreElement(playerScore);
  if (player.isBusted(playerScore)) {
    endRound(player, dealer, gameResult);
  }
  hitButtonElement.disabled = false;
}

async function stand(player: Player, dealer: Dealer, gameResult?: GameResult): Promise<void> {
  standButtonElement.disabled = true;
  dealer.revealHiddenCard();
  let dealerScore = dealer.getScore();
  dealer.updateScoreElement(dealerScore);
  while (dealerScore < 17) {
    const card = deck.pop()!;
    dealer.addCard(card);
    await dealer.addCardElement(card);
    dealerScore = dealer.getScore();
    dealer.updateScoreElement(dealerScore);
  }
  endRound(player, dealer, gameResult);
  standButtonElement.disabled = false;
}

function showGameMessage(message: Message): void {
  gameMessageElement.textContent = message;
}

function checkWinner(player: Player, dealer: Dealer): GameResult {
  const playerScore = player.getScore();
  const dealerScore = dealer.getScore();
  let result: GameResult;
  if (player.isBusted(playerScore)) {
    result = { winner: Winner.Dealer, blackjack: false };
  } else if (dealer.isBusted(dealerScore)) {
    result = { winner: Winner.Player, blackjack: false };
  } else if (playerScore > dealerScore) {
    result = { winner: Winner.Player, blackjack: false };
  } else if (dealerScore > playerScore) {
    result = { winner: Winner.Dealer, blackjack: false };
  } else {
    result = { winner: Winner.Tie, blackjack: false };
  }
  return result;
}

function endRound(player: Player, dealer: Dealer, gameResult?: GameResult): void {
  dealer.revealHiddenCard();
  dealerScoreElement.textContent = String(dealer.getScore());
  if (!gameResult?.winner) {
    gameResult = checkWinner(player, dealer);
  }
  updateChips(gameResult);
  showResult(player, gameResult);
  player.clearHand();
  dealer.clearHand();
  gameResult = undefined;
  showStartButton();
  checkOutOfChips();
}

function updateChips(gameResult: GameResult): void {
  if (gameResult.winner === Winner.Player && !gameResult.blackjack) {
    chips += blackjackSettings.bet * 2;
  } else if (gameResult.winner === Winner.Player && gameResult.blackjack) {
    chips += blackjackSettings.bet * 3;
  } else if (gameResult.winner === Winner.Tie) {
    chips += blackjackSettings.bet;
  }
  chipsValue = chips * blackjackSettings.chipValue;
  chipsValueElement.textContent = chipsValue + "$";
}

function showResult(player: Player, gameResult: GameResult): void {
  const playerScore = player.getScore();
  if (gameResult.winner === Winner.Player) {
    if (gameResult.blackjack) {
      showGameMessage(messages.blackjack);
    } else {
      showGameMessage(messages.win);
    }
  } else if (gameResult.winner === Winner.Dealer) {
    if (player.isBusted(playerScore)) {
      showGameMessage(messages.busted);
    } else {
      showGameMessage(messages.lose);
    }
  } else {
    showGameMessage(messages.tie);
  }
}

function checkOutOfChips(): void {
  if (chips <= 0) {
    showGameMessage(messages.outOfChips);

    startButtonContainerElement.style.display = "none";
  }
}
