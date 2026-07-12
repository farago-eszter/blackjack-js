import { Participant } from "./participant.js";
export class Dealer extends Participant {
    constructor(cardsElement, scoreElement) {
        super(cardsElement, scoreElement);
    }
    revealHiddenCard() {
        const image = this.cardsElement.children[1].children[0];
        image.src = `../assets/cards/poker-cards-${this.hand[1].suit}-${this.hand[1].rank}.svg`;
        this.hand[1].hidden = false;
    }
}
