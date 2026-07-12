import { Card } from "./card.js";
export class BlackjackCard extends Card {
    hidden;
    constructor(rank, suit, hidden) {
        super(rank, suit);
        this.hidden = hidden;
    }
}
