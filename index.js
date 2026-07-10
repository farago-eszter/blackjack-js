const suits = ["♥", "♦", "♣", "♠"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const chipValue = 10;
const blackjackScore = 21;
const bet = 1;
const dealerCardsElement = document.getElementById("dealerCards");
const playerCardsElement = document.getElementById("playerCards");
const gameMessageElement = document.getElementById("gameMessage");
const dealerScoreElement = document.getElementsByTagName("h1")[1];
const playerScoreElement = document.getElementsByTagName("h1")[3];
const startButtonElement = document.getElementsByClassName("start-button")[0];
const gameButtonsElement = document.getElementsByClassName("game-buttons")[0];
const hitButtonElement = document.getElementById("hit");
const standButtonElement = document.getElementById("stand");
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
let deck = [];
let chips = 10;
let chipsValue = chips * chipValue;

function startRound() {
  deck = createDeck();
  deck = shuffle(deck);
  chips -= bet;
  chipsValue = chips * chipValue;
  dealerCardsElement.innerHTML = "";
  playerCardsElement.innerHTML = "";
  gameMessageElement.textContent = "";
  let { dealerHand, playerHand } = drawInitialCards(deck);

  setButtonsAndChipsValue(playerHand.length !== 0);
  gameResult = getBlackjackResult(playerHand, dealerHand);
  if (gameResult.blackjack) {
    endRound(playerHand, dealerHand, gameResult);
  }
  hitButtonElement.onclick = () => {
    hit(playerHand, dealerHand, gameResult);
  };
  standButtonElement.onclick = () => {
    stand(playerHand, dealerHand, gameResult);
  };
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

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawInitialCards(deck) {
  let dealerHand = [];
  let playerHand = [];
  playerHand.push(deck.pop());
  addCardElement(playerHand, playerCardsElement, playerScoreElement);
  dealerHand.push(deck.pop());
  addCardElement(dealerHand, dealerCardsElement, dealerScoreElement);
  playerHand.push(deck.pop());
  addCardElement(playerHand, playerCardsElement, playerScoreElement);
  const hiddenCard = deck.pop();
  hiddenCard.hidden = true;
  dealerHand.push(hiddenCard);
  addCardElement(dealerHand, dealerCardsElement, dealerScoreElement);
  return { dealerHand, playerHand };
}

function setButtonsAndChipsValue(isGameStarted) {
  if (!isGameStarted) {
    startButtonElement.style.display = "block";
    gameButtonsElement.style.display = "none";
    betContainerElement.style.display = "none";
  } else {
    startButtonElement.style.display = "none";
    gameButtonsElement.style.display = "flex";
    betContainerElement.style.display = "flex";
  }
  chipsValueElement.textContent = chipsValue + "$";
}

function getBlackjackResult(playerHand, dealerHand) {
  let result = { winner: undefined, blackjack: false };
  if (isBlackjack(playerHand)) {
    if (isBlackjack(dealerHand, true)) {
      result = { winner: "tie", blackjack: true };
    } else {
      result = { winner: "player", blackjack: true };
    }
  }
  return result;
}

function isBlackjack(hand, includeHiddenCards = false) {
  return getScore(hand, includeHiddenCards) === blackjackScore && hand.length === 2;
}

function hit(playerHand, dealerHand, gameResult) {
  playerHand.push(deck.pop());
  addCardElement(playerHand, playerCardsElement, playerScoreElement);
  if (getScore(playerHand) > blackjackScore) {
    endRound(playerHand, dealerHand, gameResult);
  }
}

function stand(playerHand, dealerHand, gameResult) {
  revealHiddenCard(dealerHand);
  while (getScore(dealerHand) < 17) {
    dealerHand.push(deck.pop());
    addCardElement(dealerHand, dealerCardsElement, dealerScoreElement);
  }
  endRound(playerHand, dealerHand, gameResult);
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
  let convertedAceCount = 0;
  while (value > blackjackScore && convertedAceCount < aceCounter) {
    value -= 10;
    convertedAceCount++;
  }
  return value;
}

function addCardElement(hand, cardsElement, scoreElement) {
  const card = hand[hand.length - 1];
  const cardElement = document.createElement("div");
  cardElement.classList.add("card-container");
  const ImgElement = document.createElement("img");
  ImgElement.src = card.hasOwnProperty("hidden")
    ? "./assets/cards/poker-cards-hidden-card.svg"
    : `./assets/cards/poker-cards-${card.suit}-${card.rank}.svg`;
  cardElement.appendChild(ImgElement);
  cardsElement.appendChild(cardElement);
  scoreElement.textContent = getScore(hand);
}

function showGameMessage(message) {
  gameMessageElement.textContent = message;
}

function checkWinner(playerHand, dealerHand) {
  let gameResult;
  if (getScore(playerHand) > blackjackScore) {
    gameResult = { winner: "dealer", blackjack: false };
  } else if (getScore(dealerHand) > blackjackScore) {
    gameResult = { winner: "player", blackjack: false };
  } else if (getScore(playerHand) > getScore(dealerHand)) {
    gameResult = { winner: "player", blackjack: false };
  } else if (getScore(dealerHand) > getScore(playerHand)) {
    gameResult = { winner: "dealer", blackjack: false };
  } else {
    gameResult = { winner: "tie", blackjack: false };
  }
  return gameResult;
}

function endRound(playerHand, dealerHand, gameResult) {
  revealHiddenCard(dealerHand);
  dealerScoreElement.textContent = `Dealer: ${getScore(dealerHand)}`;
  if (!gameResult.winner) {
    gameResult = checkWinner(playerHand, dealerHand);
  }
  updateChips(gameResult);
  showResult(playerHand, gameResult);
  playerHand.length = 0;
  dealerHand.length = 0;
  gameResult = undefined;
  setButtonsAndChipsValue(playerHand.length !== 0);
  checkOutOfChips();
}

function revealHiddenCard(dealerHand) {
  dealerCardsElement.children[1].children[0].src = `./assets/cards/poker-cards-${dealerHand[1].suit}-${dealerHand[1].rank}.svg`;
  delete dealerHand[1].hidden;
}

function updateChips(gameResult) {
  if (gameResult.winner === "player" && gameResult.blackjack === false) {
    chips += bet * 2;
  } else if (gameResult.winner === "player" && gameResult.blackjack === true) {
    chips += bet * 3;
  } else if (gameResult.winner === "tie") {
    chips += bet;
  }
  chipsValue = chips * chipValue;
}

function showResult(playerHand, gameResult) {
  if (gameResult.winner === "player") {
    if (gameResult.blackjack) {
      showGameMessage(messages.blackjack);
    } else {
      showGameMessage(messages.win);
    }
  } else if (gameResult.winner === "dealer") {
    if (getScore(playerHand) > blackjackScore) {
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
