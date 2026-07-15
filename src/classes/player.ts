import { Participant } from "./participant.js";

export class Player extends Participant {
  constructor(cardsElement: HTMLDivElement, scoreElement: HTMLHeadingElement) {
    super(cardsElement, scoreElement);
  }
}
