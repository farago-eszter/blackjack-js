import { Participant } from "./participant.js";

export class Dealer extends Participant {
  constructor() {
    super();
  }
  revealHiddenCard(): void {
    this.hand
      .filter((card) => card.hidden)
      .forEach((card) => {
        card.hidden = false;
      });

    for (let i = 0; i <= this.hand.length - 1; i++) {
      this._scores[i] = this.getScore(false, i);
    }
  }
}
