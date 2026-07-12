export const suits = ["♥", "♦", "♣", "♠"];
export const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
export const messages = {
    blackjack: "🎉 Blackjack! You win!",
    win: "🎉 You win!",
    lose: "😢 You lose.",
    busted: "💥 You busted!",
    tie: "🤝 It's a tie.",
    outOfChips: "💸 Out of chips!",
};
export var Winner;
(function (Winner) {
    Winner["Player"] = "player";
    Winner["Dealer"] = "dealer";
    Winner["Tie"] = "tie";
})(Winner || (Winner = {}));
