import { Rank, Suit } from "../types/types.js";

export interface ICard {
  suit: Suit;
  rank: Rank;
  getValue(): number;
}
