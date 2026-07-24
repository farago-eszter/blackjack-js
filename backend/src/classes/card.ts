import { ICard } from "../interfaces/card.js";
import { Suit, Rank } from "../types/types.js";
import values from "../cardValues.json" with { type: "json" };

export class Card implements ICard {
  constructor(
    public rank: Rank,
    public suit: Suit,
  ) {}

  getValue(): number {
    return values[this.rank];
  }
}
