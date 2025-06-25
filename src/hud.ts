export default class HUD {

    timeIndicator: HTMLSpanElement;
    scoreIndicator: HTMLSpanElement;
    statusIndicator: HTMLSpanElement;
    playIndicator: HTMLSpanElement;
    maxTime: number;

    /**
     * HUD class to manage the game's heads-up display.
     * @param {number} maxTime - The maximum time for the game in seconds.
     */

    constructor(maxTime: number) {
        this.timeIndicator = document.getElementById("time")!;
        this.scoreIndicator = document.getElementById("score")!;
        this.statusIndicator = document.getElementById("status")!;
        this.playIndicator = document.getElementById("play")!;

        this.maxTime = maxTime;
        this.updateTime(this.maxTime);
        this.updateScore(0);
    }

    startGame() {
        this.playIndicator.parentElement!.classList.add("hide");
        this.scoreIndicator.textContent = "0";
        this.updateTime(this.maxTime);
        this.statusIndicator.classList.remove("win");
        this.statusIndicator.classList.remove("loss");
    }

    updateTime(secondsRemaining: number) {
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = Math.floor(secondsRemaining % 60);

        const displayMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
        const displaySeconds = seconds < 10 ? "0" + seconds : seconds.toString();

        this.timeIndicator.textContent = displayMinutes + ":" + displaySeconds;
    }

    updateScore(score: number) {
        this.scoreIndicator.textContent = score.toString();
    }

    gameOver(win = true) {
        this.statusIndicator.textContent = `YOU ${win ? "WIN" : "LOSE"}!`;
        this.statusIndicator.classList.add(win ? "win" : "loss");
        this.playIndicator.parentElement!.classList.remove("hide");
        this.playIndicator.textContent = "Press SPACE to play again!";
    }
}