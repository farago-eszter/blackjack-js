export const suits = ["♥", "♦", "♣", "♠"] as const;
export const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const;
export const messages = {
  blackjack: "🎉 Blackjack! You win!",
  win: "🎉 You win!",
  lose: "😢 You lose.",
  busted: "💥 You busted!",
  tie: "🤝 It's a tie.",
  outOfChips: "💸 Out of chips!",
} as const;
export enum Winner {
  Player = "player",
  Dealer = "dealer",
  Tie = "tie",
}
export type Suit = (typeof suits)[number];
export type Rank = (typeof ranks)[number];
export type Message = (typeof messages)[keyof typeof messages];
type ChipSettings = {
  chipValue: number;
  startingChips: number;
};
type GameSettings = {
  bet: number;
  blackjackScore: number;
};
export type BlackjackSettings = ChipSettings & GameSettings;
