import { Dealer } from "./classes/dealer.js";
import { Player } from "./classes/player.js";
import { BlackjackCard } from "./classes/blackjackCard.js";
import { GameResult } from "./interfaces/gameResult.js";
import { suits, ranks, messages, Winner, Message } from "./types/types.js";
import { blackjackSettings } from "./gameConfig.js";
import { gameState } from "./server.js";

export let deck: BlackjackCard[] = [];

export function prepareRound(player: Player, dealer: Dealer): void {
  player.clearHand();
  dealer.clearHand();
  deck = createDeck();
  deck = shuffle(deck);
  gameState.chips -= blackjackSettings.bet;
  gameState.chipsValue = gameState.chips * blackjackSettings.chipValue;
  delete gameState.message;
  gameState.isRoundActive = true;
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

export function drawInitialCards(deck: BlackjackCard[], player: Player, dealer: Dealer): void {
  dealCard(deck, player);
  dealCard(deck, dealer);
  dealCard(deck, player);
  dealCard(deck, dealer, true);
}
function dealCard(deck: BlackjackCard[], participant: Player | Dealer, hidden = false): void {
  const card = deck.pop()!;
  card.hidden = hidden;
  participant.addCard(card);
}

export function getBlackjackResult(player: Player, dealer: Dealer): GameResult | undefined {
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

function checkWinner(player: Player, dealer: Dealer): GameResult {
  const playerScore = player.currentScore();
  const dealerScore = dealer.currentScore();
  let result: GameResult;
  if (player.isBusted()) {
    result = { winner: Winner.Dealer, blackjack: false };
  } else if (dealer.isBusted()) {
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

export function endRound(player: Player, dealer: Dealer, gameResult?: GameResult): void {
  dealer.revealHiddenCard();
  if (!gameResult?.winner) {
    gameResult = checkWinner(player, dealer);
  }
  gameState.isRoundActive = false;
  updateChips(gameResult);
  setMessage(player, gameResult);
  checkOutOfChips();
}

function updateChips(gameResult: GameResult): void {
  if (gameResult.winner === Winner.Player && !gameResult.blackjack) {
    gameState.chips += blackjackSettings.bet * 2;
  } else if (gameResult.winner === Winner.Player && gameResult.blackjack) {
    gameState.chips += blackjackSettings.bet * 3;
  } else if (gameResult.winner === Winner.Tie) {
    gameState.chips += blackjackSettings.bet;
  }
  gameState.chipsValue = gameState.chips * blackjackSettings.chipValue;
}

function setMessage(player: Player, gameResult: GameResult): void {
  if (gameResult.winner === Winner.Player) {
    if (gameResult.blackjack) {
      gameState.message = messages.blackjack;
    } else {
      gameState.message = messages.win;
    }
  } else if (gameResult.winner === Winner.Dealer) {
    if (player.isBusted()) {
      gameState.message = messages.busted;
    } else {
      gameState.message = messages.lose;
    }
  } else {
    gameState.message = messages.tie;
  }
}

function checkOutOfChips(): void {
  if (gameState.chips <= 0) {
    gameState.message = messages.outOfChips;
  }
}
