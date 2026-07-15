import { Winner } from "../types/types.js";

export interface GameResult {
  winner?: Winner;
  blackjack: boolean;
}
