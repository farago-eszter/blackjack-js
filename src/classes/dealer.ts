import { Participant } from "./participant.js";

export class Dealer extends Participant {
  constructor(cardsElement: HTMLDivElement, scoreElement: HTMLHeadingElement) {
    super(cardsElement, scoreElement);
  }
  revealHiddenCard(): void {
    const image = this.cardsElement.children[1].children[0] as HTMLImageElement;
    image.src = `../assets/cards/poker-cards-${this.hand[1].suit}-${this.hand[1].rank}.svg`;
    this.hand[1].hidden = false;
  }
}
