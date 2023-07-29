export default class HUD {
    constructor(maxTime) {
        this.timeIndicator = document.getElementById("time");
        this.scoreIndicator = document.getElementById("score");
        this.statusIndicator = document.getElementById("status");
        this.playIndicator = document.getElementById("play");

        this.maxTime = maxTime;
        this.updateTime(this.maxTime);
        this.updateScore(0);
    }

    startGame() {
        this.playIndicator.parentElement.classList.add("hide");
        this.scoreIndicator.textContent = 0;
        this.updateTime(this.maxTime);
        this.statusIndicator.classList.remove("win");
        this.statusIndicator.classList.remove("loss");
    }

    updateTime(secondsRemaining) {
        let minutes = parseInt(secondsRemaining / 60, 10);
        let seconds = parseInt(secondsRemaining % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        this.timeIndicator.textContent = minutes + ":" + seconds;
    }

    updateScore(score) {
        this.scoreIndicator.textContent = score;
    }

    gameOver(win = true) {
        this.statusIndicator.textContent = `YOU ${win ? "WIN" : "LOSE"}!`;
        this.statusIndicator.classList.add(win ? "win" : "loss");
        this.playIndicator.parentElement.classList.remove("hide");
        this.playIndicator.textContent = "Press SPACE to play again!";
    }
}