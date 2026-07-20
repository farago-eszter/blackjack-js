import { BlackjackCard } from "./blackjackCard.js";
import { blackjackSettings } from "../gameConfig.js";

export abstract class Participant {
  private _hand: BlackjackCard[] = [];
  protected _scores: number[] = [];

  constructor() {}

  get hand(): BlackjackCard[] {
    return this._hand;
  }
  get scores(): number[] {
    return this._scores;
  }

  addCard(card: BlackjackCard): void {
    this._hand.push(card);
    this.updateScore();
  }

  clearHand(): void {
    this._hand = [];
    this._scores = [];
  }

  getScore(includeHiddenCards?: boolean): number {
    let value = 0;
    let aceCounter = 0;
    let cards;
    if (!includeHiddenCards) {
      cards = this.hand.filter((card) => !card.hidden);
    } else {
      cards = this.hand;
    }
    for (let card of cards) {
      if (card.rank === "A") {
        aceCounter++;
      }
      value += card.getValue();
    }
    let convertedAceCount = 0;
    while (value > blackjackSettings.blackjackScore && convertedAceCount < aceCounter) {
      value -= 10;
      convertedAceCount++;
    }
    return value;
  }

  updateScore(): void {
    const score = this.getScore();
    this._scores.push(score);
  }

  currentScore(): number {
    return this._scores[this._scores.length - 1];
  }

  isBusted(): boolean {
    return this._scores[this._scores.length - 1] > blackjackSettings.blackjackScore;
  }
}
