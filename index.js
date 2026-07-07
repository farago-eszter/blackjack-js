const suits = ["♥", "♦", "♣", "♠"];
const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const chipValue = 10;
const blackJackScore = 21;
const bet = 1;
const dealersCardsElement = document.getElementById("dealersCards");
const playerCardsElement = document.getElementById("playersCards");
const gameMessageElement = document.getElementById("gameMessage");
const dealerScoreElement = document.getElementsByTagName("h1")[0];
const playerScoreElement = document.getElementsByTagName("h1")[1];
const startButtonElement = document.getElementsByClassName("start-button")[0];
const gameButtonsElement = document.getElementsByClassName("game-buttons")[0];
const betContainerElement = document.getElementsByClassName("bet-container")[0];
const chipsValueElement = document.getElementById("chipsValue");
const messages = {
  blackjack: "🎉 Blackjack! You win!",
  win: "🎉 You win!",
  lose: "😢 You lose.",
  busted: "💥 You busted!",
  tie: "🤝 It's a tie.",
  outOfChips: "💸 Out of chips!",
};
let chips = 10;
let chipsValue = chips * chipValue;
let deck = createDeck();
let dealerHand = [];
let playerHand = [];
let gameResult;

function startRound() {
  deck = createDeck();
  shuffle();
  chips -= bet;
  chipsValue = chips * chipValue;
  dealersCardsElement.innerHTML = "";
  playerCardsElement.innerHTML = "";
  gameMessageElement.textContent = "";
  drawInitialCards();
  setButtonsAndChipsValue();
  getBlackjackResult();
  if (gameResult) {
    endRound();
  }
}

function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

function shuffle() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawInitialCards() {
  playerHand = [deck.pop()];
  addCardElement(true);
  dealerHand = [deck.pop()];
  addCardElement(false);
  playerHand.push(deck.pop());
  addCardElement(true);
  const hiddenCard = deck.pop();
  hiddenCard.hidden = true;
  dealerHand.push(hiddenCard);
  addCardElement(false);
}

function setButtonsAndChipsValue() {
  if (playerHand.length === 0) {
    startButtonElement.style.display = "block";
    gameButtonsElement.style.display = "none";
    betContainerElement.style.display = "none";
  } else {
    startButtonElement.style.display = "none";
    gameButtonsElement.style.display = "flex";
    betContainerElement.style.display = "block";
  }
  chipsValueElement.textContent = chipsValue + "$";
}

function getBlackjackResult() {
  if (
    getScore(playerHand) === blackJackScore &&
    getScore(dealerHand, true) === blackJackScore
  ) {
    gameResult = { winner: "tie", blackJack: true };
  } else if (getScore(playerHand) === blackJackScore) {
    gameResult = { winner: "player", blackJack: true };
  }
}

function hit() {
  playerHand.push(deck.pop());
  addCardElement(true);
  if (getScore(playerHand) > blackJackScore) {
    endRound();
  }
}

function stand() {
  revealHiddenCard();
  while (getScore(dealerHand) < 17) {
    dealerHand.push(deck.pop());
    addCardElement(false);
  }
  endRound();
}

function getScore(cards, includeHiddenCards = false) {
  let value = 0;
  let aceCounter = 0;
  if (!includeHiddenCards) {
    cards = cards.filter((card) => !card.hasOwnProperty("hidden"));
  }
  for (let card of cards) {
    if (card.rank === "A") {
      value += 11;
      aceCounter++;
    } else if (["J", "Q", "K"].includes(card.rank)) {
      value += 10;
    } else {
      value += Number(card.rank);
    }
  }
  while (value > blackJackScore && aceCounter > 0) {
    value -= 10;
    aceCounter--;
  }
  return value;
}

function addCardElement(isPlayer) {
  const card = isPlayer
    ? playerHand[playerHand.length - 1]
    : dealerHand[dealerHand.length - 1];
  const cardElement = document.createElement("div");
  cardElement.classList.add("card-container");
  const ImgElement = document.createElement("img");
  ImgElement.src = card.hasOwnProperty("hidden")
    ? "./assets/cards/poker-cards-hidden-card.svg"
    : `./assets/cards/poker-cards-${card.suit}-${card.rank}.svg`;
  cardElement.appendChild(ImgElement);
  isPlayer
    ? playersCards.appendChild(cardElement)
    : dealersCards.appendChild(cardElement);

  if (isPlayer) {
    playerScoreElement.textContent = `Player: ${getScore(playerHand)}`;
  } else {
    dealerScoreElement.textContent = `Dealer: ${getScore(dealerHand)}`;
  }
}

function showGameMessage(message) {
  gameMessageElement.textContent = message;
}

function checkWinner() {
  if (getScore(playerHand) > blackJackScore) {
    gameResult = { winner: "dealer", blackJack: false };
  } else if (getScore(dealerHand) > blackJackScore) {
    gameResult = { winner: "player", blackJack: false };
  } else if (getScore(playerHand) > getScore(dealerHand)) {
    gameResult = { winner: "player", blackJack: false };
  } else if (getScore(dealerHand) > getScore(playerHand)) {
    gameResult = { winner: "dealer", blackJack: false };
  } else {
    gameResult = { winner: "tie", blackJack: false };
  }
}

function endRound() {
  revealHiddenCard();
  dealerScoreElement.textContent = `Dealer: ${getScore(dealerHand)}`;
  if (!gameResult) {
    checkWinner();
  }
  updateChips();
  showResult();
  playerHand = [];
  dealerHand = [];
  gameResult = undefined;
  setButtonsAndChipsValue();
  checkOutOfChips();
}

function revealHiddenCard() {
  dealersCardsElement.children[1].children[0].src = `./assets/cards/poker-cards-${dealerHand[1].suit}-${dealerHand[1].rank}.svg`;
  delete dealerHand[1].hidden;
}

function updateChips() {
  if (gameResult.winner === "player" && gameResult.blackJack === false) {
    chips += bet * 2;
  } else if (gameResult.winner === "player" && gameResult.blackJack === true) {
    chips += bet * 3;
  } else if (gameResult.winner === "tie") {
    chips += bet;
  }
  chipsValue = chips * chipValue;
}

function showResult() {
  if (gameResult.winner === "player") {
    if (gameResult.blackJack) {
      showGameMessage(messages.blackjack);
    } else {
      showGameMessage(messages.win);
    }
  } else if (gameResult.winner === "dealer") {
    if (getScore(playerHand) > blackJackScore) {
      showGameMessage(messages.busted);
    } else {
      showGameMessage(messages.lose);
    }
  } else {
    showGameMessage(messages.tie);
  }
}

function checkOutOfChips() {
  if (chips <= 0) {
    showGameMessage(messages.outOfChips);

    startButtonElement.style.display = "none";
  }
}
