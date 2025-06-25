export default class HUD {

    timeIndicator: HTMLSpanElement;
    scoreIndicator: HTMLSpanElement;
    winIndicator: HTMLSpanElement;
    playIndicator: HTMLSpanElement;
    maxTime: number;

    /**
     * HUD class to manage the game's heads-up display.
     * @param {number} maxTime - The maximum time for the game in seconds.
     */

    constructor(maxTime: number) {
        this.timeIndicator = document.getElementById("time")!;
        this.scoreIndicator = document.getElementById("score")!;
        this.winIndicator = document.getElementById("status")!;
        this.playIndicator = document.getElementById("play")!;

        this.maxTime = maxTime;
        this.updateTime(this.maxTime);
        this.updateScore(0);
    }

    startGame() {
        this.playIndicator.parentElement!.classList.add("hide");
        this.scoreIndicator.textContent = "0";
        this.scoreIndicator.setAttribute("aria-label", "Current score: 0 points");
        this.updateTime(this.maxTime);
        this.winIndicator.classList.remove("win");
        this.winIndicator.classList.remove("loss");
        this.winIndicator.textContent = "";
        this.winIndicator.setAttribute("aria-label", "Game in progress");
    }

    pauseGame(paused = true) {
        if (paused) this.playIndicator.parentElement!.classList.remove("hide");
        else this.playIndicator.parentElement!.classList.add("hide");
        this.playIndicator.textContent = paused ? "Game Paused" : "";
        this.playIndicator.setAttribute("aria-label", paused ? "Game is paused. Press Space to resume." : "Game resumed");
    }

    updateTime(secondsRemaining: number) {
        const minutes = Math.round(secondsRemaining / 60);
        const seconds = Math.ceil(secondsRemaining % 60);

        const displayMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
        const displaySeconds = seconds < 10 ? "0" + seconds : seconds.toString();

        this.timeIndicator.textContent = displayMinutes + ":" + displaySeconds;

        // Announce time updates to screen readers at intervals
        if (secondsRemaining <= 10 || Math.ceil(secondsRemaining % 15) === 0) {
            this.timeIndicator.setAttribute("aria-label", `Time remaining: ${minutes} minutes and ${seconds} seconds`);
        }
    }

    updateScore(score: number) {
        this.scoreIndicator.textContent = score.toString();
        this.scoreIndicator.setAttribute("aria-label", `Current score: ${score} points`);
    }

    gameOver(win = true) {
        const message = `YOU ${win ? "WIN" : "LOSE"}!`;
        this.winIndicator.textContent = message;
        this.winIndicator.classList.add(win ? "win" : "loss");
        this.winIndicator.setAttribute("aria-label", `Game over: ${message}`);

        this.playIndicator.parentElement!.classList.remove("hide");
        this.playIndicator.textContent = "Press SPACE to play again!";
        this.playIndicator.setAttribute("aria-label", "Game ended. Press space bar to play again");
    }
}