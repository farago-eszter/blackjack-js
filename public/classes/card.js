export class Card {
    rank;
    suit;
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
    }
    getValue() {
        let value;
        if (this.rank === "A") {
            value = 11;
        }
        else if (["J", "Q", "K"].includes(this.rank)) {
            value = 10;
        }
        else {
            value = Number(this.rank);
        }
        return value;
    }
}
