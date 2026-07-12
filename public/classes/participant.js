export class Participant {
    cardsElement;
    scoreElement;
    _hand = [];
    constructor(cardsElement, scoreElement) {
        this.cardsElement = cardsElement;
        this.scoreElement = scoreElement;
    }
    get hand() {
        return this._hand;
    }
    addCard(card) {
        this._hand.push(card);
    }
    clearHand() {
        this._hand = [];
    }
    getScore(blackjackScore, includeHiddenCards) {
        let value = 0;
        let aceCounter = 0;
        let cards;
        if (!includeHiddenCards) {
            cards = this.hand.filter((card) => !card.hidden);
        }
        else {
            cards = this.hand;
        }
        for (let card of cards) {
            if (card.rank === "A") {
                aceCounter++;
            }
            value += card.getValue();
        }
        let convertedAceCount = 0;
        while (value > blackjackScore && convertedAceCount < aceCounter) {
            value -= 10;
            convertedAceCount++;
        }
        return value;
    }
    async addCardElement(blackjackScore) {
        await sleep(300);
        const card = this.hand[this.hand.length - 1];
        const cardElement = document.createElement("div");
        cardElement.classList.add("card-container");
        const imgElement = document.createElement("img");
        imgElement.src = card.hidden
            ? "../assets/cards/poker-cards-hidden-card.svg"
            : `../assets/cards/poker-cards-${card.suit}-${card.rank}.svg`;
        cardElement.appendChild(imgElement);
        this.cardsElement.appendChild(cardElement);
        this.scoreElement.textContent = String(this.getScore(blackjackScore));
    }
    isBusted(blackjackScore) {
        return this.getScore(blackjackScore) > blackjackScore;
    }
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
