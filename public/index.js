import { Dealer } from "./classes/dealer.js";
import { Player } from "./classes/player.js";
import { BlackjackCard } from "./classes/blackjackCard.js";
import { suits, ranks, messages, Winner } from "./types/types.js";
const blackjackSettings = {
    chipValue: 10,
    startingChips: 10,
    bet: 1,
    blackjackScore: 21,
};
const dealerCardsElement = document.getElementById("dealerCards");
const playerCardsElement = document.getElementById("playerCards");
const gameMessageElement = document.getElementById("gameMessage");
const dealerScoreElement = document.getElementsByTagName("h1")[1];
const playerScoreElement = document.getElementsByTagName("h1")[3];
const startButtonContainerElement = document.getElementsByClassName("start-button")[0];
const gameButtonsContainerElement = document.getElementsByClassName("game-buttons")[0];
const hitButtonElement = document.getElementById("hit");
const standButtonElement = document.getElementById("stand");
const startButtonElement = document.getElementById("start");
const betContainerElement = document.getElementsByClassName("bet-container")[0];
const chipsValueElement = document.getElementById("chipsValue");
let chips = blackjackSettings.startingChips;
let chipsValue = chips * blackjackSettings.chipValue;
let deck = [];
startButtonElement.onclick = startRound;
async function startRound() {
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
function createDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push(new BlackjackCard(rank, suit, false));
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
async function drawInitialCards(deck, player, dealer) {
    player.addCard(deck.pop());
    await player.addCardElement(blackjackSettings.blackjackScore);
    dealer.addCard(deck.pop());
    await dealer.addCardElement(blackjackSettings.blackjackScore);
    player.addCard(deck.pop());
    await player.addCardElement(blackjackSettings.blackjackScore);
    const hiddenCard = deck.pop();
    hiddenCard.hidden = true;
    dealer.addCard(hiddenCard);
    await dealer.addCardElement(blackjackSettings.blackjackScore);
}
function showStartButton() {
    startButtonContainerElement.style.display = "block";
    gameButtonsContainerElement.style.display = "none";
    betContainerElement.style.display = "none";
}
function showGameButtons() {
    startButtonContainerElement.style.display = "none";
    gameButtonsContainerElement.style.display = "flex";
}
function showBet() {
    betContainerElement.style.display = "flex";
    chipsValueElement.textContent = chipsValue + "$";
}
function getBlackjackResult(player, dealer) {
    let result;
    if (isBlackjack(player)) {
        if (isBlackjack(dealer, true)) {
            result = { winner: Winner.Tie, blackjack: true };
        }
        else {
            result = { winner: Winner.Player, blackjack: true };
        }
    }
    return result;
}
function isBlackjack(participant, includeHiddenCards = false) {
    return (participant.getScore(blackjackSettings.blackjackScore, includeHiddenCards) === blackjackSettings.blackjackScore &&
        participant.hand.length === 2);
}
async function hit(player, dealer, gameResult) {
    hitButtonElement.disabled = true;
    player.addCard(deck.pop());
    await player.addCardElement(blackjackSettings.blackjackScore);
    if (player.isBusted(blackjackSettings.blackjackScore)) {
        endRound(player, dealer, gameResult);
    }
    hitButtonElement.disabled = false;
}
async function stand(player, dealer, gameResult) {
    standButtonElement.disabled = true;
    dealer.revealHiddenCard();
    while (dealer.getScore(blackjackSettings.blackjackScore) < 17) {
        dealer.addCard(deck.pop());
        await dealer.addCardElement(blackjackSettings.blackjackScore);
    }
    endRound(player, dealer, gameResult);
    standButtonElement.disabled = false;
}
function showGameMessage(message) {
    gameMessageElement.textContent = message;
}
function checkWinner(player, dealer) {
    let playerScore = player.getScore(blackjackSettings.blackjackScore);
    let dealerScore = dealer.getScore(blackjackSettings.blackjackScore);
    let result;
    if (player.isBusted(blackjackSettings.blackjackScore)) {
        result = { winner: Winner.Dealer, blackjack: false };
    }
    else if (dealer.isBusted(blackjackSettings.blackjackScore)) {
        result = { winner: Winner.Player, blackjack: false };
    }
    else if (playerScore > dealerScore) {
        result = { winner: Winner.Player, blackjack: false };
    }
    else if (dealerScore > playerScore) {
        result = { winner: Winner.Dealer, blackjack: false };
    }
    else {
        result = { winner: Winner.Tie, blackjack: false };
    }
    return result;
}
function endRound(player, dealer, gameResult) {
    dealer.revealHiddenCard();
    dealerScoreElement.textContent = String(dealer.getScore(blackjackSettings.blackjackScore));
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
function updateChips(gameResult) {
    if (gameResult.winner === Winner.Player && !gameResult.blackjack) {
        chips += blackjackSettings.bet * 2;
    }
    else if (gameResult.winner === Winner.Player && gameResult.blackjack) {
        chips += blackjackSettings.bet * 3;
    }
    else if (gameResult.winner === Winner.Tie) {
        chips += blackjackSettings.bet;
    }
    chipsValue = chips * blackjackSettings.chipValue;
    chipsValueElement.textContent = chipsValue + "$";
}
function showResult(player, gameResult) {
    if (gameResult.winner === Winner.Player) {
        if (gameResult.blackjack) {
            showGameMessage(messages.blackjack);
        }
        else {
            showGameMessage(messages.win);
        }
    }
    else if (gameResult.winner === Winner.Dealer) {
        if (player.isBusted(blackjackSettings.blackjackScore)) {
            showGameMessage(messages.busted);
        }
        else {
            showGameMessage(messages.lose);
        }
    }
    else {
        showGameMessage(messages.tie);
    }
}
function checkOutOfChips() {
    if (chips <= 0) {
        showGameMessage(messages.outOfChips);
        startButtonContainerElement.style.display = "none";
    }
}
