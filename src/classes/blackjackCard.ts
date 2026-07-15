import { IBlackjackCard } from "../interfaces/blackjackCard.js";
import { Suit, Rank } from "../types/types.js";
import { Card } from "./card.js";

export class BlackjackCard extends Card implements IBlackjackCard {
  constructor(
    rank: Rank,
    suit: Suit,
    public hidden: boolean,
  ) {
    super(rank, suit);
  }
}
