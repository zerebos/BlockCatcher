import DOMManager, {type UIState} from "./utils/dom-manager";

export default class HUD {
    private domManager: DOMManager;
    private maxTime: number;
    private currentState: UIState;

    /**
     * HUD class to manage the game's heads-up display using DOM abstraction.
     * @param {number} maxTime - The maximum time for the game in seconds.
     * @param {DOMManager} domManager - The DOM manager instance
     */
    constructor(maxTime: number, domManager: DOMManager) {
        this.domManager = domManager;
        this.maxTime = maxTime;

        const minutes = Math.floor(maxTime / 60);
        const seconds = maxTime % 60;

        this.currentState = {
            score: 0,
            timeMinutes: minutes,
            timeSeconds: seconds,
            gameStatus: "ready",
            message: ""
        };

        // Initialize UI
        this.domManager.updateUI(this.currentState);
    }

    startGame() {
        this.currentState = {
            ...this.currentState,
            score: 0,
            gameStatus: "playing",
            message: ""
        };

        this.updateTime(this.maxTime);
        this.domManager.updateUI(this.currentState);
    }

    pauseGame(paused = true) {
        this.currentState = {
            ...this.currentState,
            gameStatus: paused ? "paused" : "playing",
            message: paused ? "Game Paused" : ""
        };

        this.domManager.updateUI(this.currentState);
    }

    updateTime(secondsRemaining: number) {
        const minutes = Math.round(secondsRemaining / 60);
        const seconds = Math.ceil(secondsRemaining % 60);

        this.currentState = {
            ...this.currentState,
            timeMinutes: minutes,
            timeSeconds: seconds
        };

        // Update only the time to avoid unnecessary full UI updates
        this.domManager.updateTime(minutes, seconds);
    }

    updateScore(score: number) {
        this.currentState = {
            ...this.currentState,
            score
        };

        // Update only the score to avoid unnecessary full UI updates
        this.domManager.updateScore(score);
    }

    gameOver(win = true) {
        this.currentState = {
            ...this.currentState,
            gameStatus: win ? "win" : "lose",
            message: ""
        };

        this.domManager.updateUI(this.currentState);
        this.domManager.focusCanvas();
    }
}
