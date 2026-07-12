import { Participant } from "./participant.js";
export class Player extends Participant {
    constructor(cardsElement, scoreElement) {
        super(cardsElement, scoreElement);
    }
}
