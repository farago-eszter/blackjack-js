import { ICard } from "../interfaces/card.js";
import { Suit, Rank } from "../types/types.js";

export class Card implements ICard {
  constructor(
    public rank: Rank,
    public suit: Suit,
  ) {}

  getValue(): number {
    let value;
    if (this.rank === "A") {
      value = 11;
    } else if (["J", "Q", "K"].includes(this.rank)) {
      value = 10;
    } else {
      value = Number(this.rank);
    }
    return value;
  }
}
