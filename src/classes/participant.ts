import { BlackjackCard } from "../classes/blackjackCard.js";

export abstract class Participant {
  private _hand: BlackjackCard[] = [];

  constructor(
    readonly cardsElement: HTMLDivElement,
    public scoreElement: HTMLHeadingElement,
  ) {}

  get hand(): BlackjackCard[] {
    return this._hand;
  }

  addCard(card: BlackjackCard): void {
    this._hand.push(card);
  }

  clearHand(): void {
    this._hand = [];
  }

  getScore(blackjackScore: number, includeHiddenCards?: boolean): number {
    let value = 0;
    let aceCounter = 0;
    let cards;
    if (!includeHiddenCards) {
      cards = this.hand.filter((card) => !card.hidden);
    } else {
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

  async addCardElement(blackjackScore: number): Promise<void> {
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

  isBusted(blackjackScore: number): boolean {
    return this.getScore(blackjackScore) > blackjackScore;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
