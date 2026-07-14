import { BlackjackCard } from "../classes/blackjackCard.js";
import { blackjackSettings } from "../gameConfig.js";

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

  getScore(includeHiddenCards?: boolean): number {
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
    while (value > blackjackSettings.blackjackScore && convertedAceCount < aceCounter) {
      value -= 10;
      convertedAceCount++;
    }
    return value;
  }

  async addCardElement(card: BlackjackCard): Promise<void> {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card-container", "card-deal-animation");
    const imgElement = document.createElement("img");
    imgElement.src = card.hidden
      ? "../assets/cards/poker-cards-hidden-card.svg"
      : `../assets/cards/poker-cards-${card.suit}-${card.rank}.svg`;
    cardElement.appendChild(imgElement);
    this.cardsElement.appendChild(cardElement);
    await this.waitForAnimation(cardElement);
  }

  private waitForAnimation(element: HTMLDivElement): Promise<void> {
    return new Promise((resolve) => {
      element.addEventListener("animationend", () => resolve(), {
        once: true,
      });
    });
  }

  updateScoreElement(score: number): void {
    this.scoreElement.textContent = String(score);
  }

  isBusted(score: number): boolean {
    return score > blackjackSettings.blackjackScore;
  }
}
