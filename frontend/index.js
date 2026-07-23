const dealerCardsElement = document.getElementById("dealerCards");
const playerCardsElement = document.getElementById("playerCards");
const gameMessageElement = document.getElementById("gameMessage");
const dealerScoreElement = document.getElementsByTagName("h1")[1];
const playerScoreElement = document.getElementsByTagName("h1")[3];
const gameButtonsContainerElement = document.getElementsByClassName("game-buttons")[0];
const hitButtonElement = document.getElementById("hit");
const standButtonElement = document.getElementById("stand");
const newRoundButtonElement = document.getElementById("new-round");
const newGameButtonElement = document.getElementById("new-game");
const betContainerElement = document.getElementsByClassName("bet-container")[0];
const chipsValueElement = document.getElementById("chipsValue");

async function startNewGame() {
  $.get("http://localhost:8000/blackjack/new-game", async function (gameState) {
    clearGameView();
    await updateView(gameState);
  });
}

function clearGameView() {
  playerCardsElement.innerHTML = "";
  dealerCardsElement.innerHTML = "";
  playerScoreElement.textContent = "";
  dealerScoreElement.textContent = "";
  gameMessageElement.textContent = "";
}

async function updateView(gameState) {
  if (gameState.isRoundActive) {
    betContainerElement.style.display = "flex";
    newRoundButtonElement.style.display = "none";
    newGameButtonElement.style.display = "none";
    gameButtonsContainerElement.style.display = "flex";
  } else {
    betContainerElement.style.display = "none";
    gameButtonsContainerElement.style.display = "none";
    if (gameState.chipsValue === 0) {
      newRoundButtonElement.style.display = "none";
      newGameButtonElement.style.display = "block";
    } else {
      newGameButtonElement.style.display = "none";
      newRoundButtonElement.style.display = "block";
    }
  }
  chipsValueElement.textContent = gameState.chipsValue + "$";
  gameMessageElement.textContent = gameState.message ?? "";
  await updateParticipant(gameState.player, playerCardsElement, playerScoreElement);
  await updateParticipant(gameState.dealer, dealerCardsElement, dealerScoreElement);
}

async function updateParticipant(participant, cardsElement, scoreElement) {
  const shownCards = cardsElement.children.length;
  for (let i = shownCards; i < participant._hand.length; i++) {
    const card = participant._hand[i];
    const cardElement = document.createElement("div");
    cardElement.classList.add("card-container", "card-deal-animation");
    const imgElement = document.createElement("img");
    imgElement.src = card.hidden
      ? "/assets/cards/poker-cards-hidden-card.svg"
      : `/assets/cards/poker-cards-${card.suit}-${card.rank}.svg`;
    cardElement.appendChild(imgElement);
    cardsElement.appendChild(cardElement);
    await waitForAnimation(cardElement);
    scoreElement.textContent = String(participant._scores[i]);
  }
}

async function waitForAnimation(element) {
  return new Promise((resolve) => {
    element.addEventListener("animationend", () => resolve(), {
      once: true,
    });
  });
}

newGameButtonElement.onclick = () => {
  $.get("http://localhost:8000/blackjack/new-game", async function (gameState) {});
};

newGameButtonElement.onclick = startNewGame;

newRoundButtonElement.onclick = () => {
  $.get("http://localhost:8000/blackjack/new-round", async function (gameState) {
    clearGameView();
    standButtonElement.disabled = true;
    hitButtonElement.disabled = true;
    await updateView(gameState);
    standButtonElement.disabled = false;
    hitButtonElement.disabled = false;
  });
};

hitButtonElement.onclick = () => {
  $.get("http://localhost:8000/blackjack/hit", async function (gameState) {
    standButtonElement.disabled = true;
    hitButtonElement.disabled = true;
    await updateView(gameState);
    standButtonElement.disabled = false;
    hitButtonElement.disabled = false;
  });
};

standButtonElement.onclick = () => {
  $.get("http://localhost:8000/blackjack/stand", async function (gameState) {
    standButtonElement.disabled = true;
    hitButtonElement.disabled = true;
    const image = dealerCardsElement.children[1].children[0];
    if (image) {
      const hiddenCard = gameState.dealer._hand[1];

      image.src = `/assets/cards/poker-cards-${hiddenCard.suit}-${hiddenCard.rank}.svg`;
    }
    const dealerScores = gameState.dealer._scores;
    dealerScoreElement.textContent = String(dealerScores[1]);
    await updateView(gameState);
    standButtonElement.disabled = false;
    hitButtonElement.disabled = false;
  });
};

startNewGame();
