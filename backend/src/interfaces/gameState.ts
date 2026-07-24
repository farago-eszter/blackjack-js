import { Dealer } from "../classes/dealer";
import { Player } from "../classes/player";
import { Message } from "../types/types";

export interface GameState {
  player: Player;
  dealer: Dealer;
  chips: number;
  chipsValue: number;
  message?: Message;
  isRoundActive: boolean;
}
