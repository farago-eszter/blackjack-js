import { Participant } from "./participant.js";

export class Dealer extends Participant {
  constructor() {
    super();
  }
  revealHiddenCard(): void {
    this.hand[1].hidden = false;
    this._scores[1] = this.hand[0].getValue() + this.hand[1].getValue();
  }
}
