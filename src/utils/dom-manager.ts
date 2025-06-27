/**
 * DOM Manager - Abstracts DOM operations for the game
 * Provides a clean interface for UI updates and element management
 */

import type {GameElements, UIState} from "../types";

export default class DOMManager {
    private elements: GameElements;
    private isInitialized = false;

    constructor() {
        this.elements = {} as GameElements;
    }

    /**
     * Initialize DOM elements - call this after DOM is ready
     */
    initialize(): boolean {
        try {
            this.elements.canvas = this.getElement<HTMLCanvasElement>("gl-canvas");
            this.elements.score = this.getElement("score");
            this.elements.time = this.getElement("time");
            this.elements.status = this.getElement("status");
            this.elements.play = this.getElement("play");
            this.elements.playParent = this.elements.play.parentElement!;
            this.elements.audioToggle = this.getElement<HTMLButtonElement>("audio-toggle");

            this.isInitialized = true;
            return true;
        }
        catch {
            // Error handling for missing DOM elements
            return false;
        }
    }

    /**
     * Get DOM element with type safety and error handling
     */
    private getElement<T extends HTMLElement = HTMLElement>(id: string): T {
        const element = document.getElementById(id) as T;
        if (!element) {
            throw new Error(`Element with id '${id}' not found`);
        }
        return element;
    }

    /**
     * Check if DOM manager is ready to use
     */
    isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * Get the game canvas element
     */
    getCanvas(): HTMLCanvasElement {
        this.ensureInitialized();
        return this.elements.canvas;
    }

    /**
     * Update the game UI with current state
     */
    updateUI(state: UIState): void {
        this.ensureInitialized();

        // Update score
        this.updateScore(state.score);

        // Update time
        this.updateTime(state.timeMinutes, state.timeSeconds);

        // Update game status
        this.updateGameStatus(state.gameStatus, state.message);
    }

    /**
     * Update score display with accessibility and synthwave glow effect
     */
    updateScore(score: number): void {
        this.ensureInitialized();

        this.elements.score.textContent = score.toString();
        this.elements.score.setAttribute("aria-label", `Current score: ${score} points`);

        // Add synthwave glow effect on score update
        this.elements.score.classList.add("score-update");

        // Trigger the scoreUpdate animation
        this.elements.score.style.animation = "none";
        // Force reflow to reset animation
        void this.elements.score.offsetHeight;
        this.elements.score.style.animation = "scoreUpdate 0.3s ease-out";

        // Remove the class after animation completes
        setTimeout(() => {
            this.elements.score.classList.remove("score-update");
        }, 300);
    }

    /**
     * Update time display with accessibility and time warning
     * Accepts fractional seconds and handles display conversion
     */
    updateTime(secondsRemaining: number): void;
    updateTime(minutes: number, seconds: number): void;
    updateTime(minutesOrSeconds: number, seconds?: number): void {
        this.ensureInitialized();

        let minutes: number;
        let displaySeconds: number;

        // Handle overloaded parameters
        if (seconds === undefined) {
            // Called with total seconds (fractional)
            const totalSeconds = minutesOrSeconds;
            minutes = Math.floor(Math.ceil(totalSeconds) / 60);
            displaySeconds = Math.ceil(Math.ceil(totalSeconds) % 60);
        }
        else {
            // Called with separate minutes and seconds
            minutes = minutesOrSeconds;
            displaySeconds = seconds;
        }

        const displayMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
        const displaySecondsStr = displaySeconds < 10 ? "0" + displaySeconds : displaySeconds.toString();

        this.elements.time.textContent = `${displayMinutes}:${displaySecondsStr}`;

        // Add synthwave warning when time is low (last 10 seconds)
        const totalSeconds = minutes * 60 + displaySeconds;
        if (totalSeconds <= 10 && totalSeconds > 0) {
            this.elements.time.classList.add("time-warning");
        }
        else {
            this.elements.time.classList.remove("time-warning");
        }

        // Announce time updates to screen readers at intervals
        if (totalSeconds <= 10 || totalSeconds % 15 === 0) {
            this.elements.time.setAttribute("aria-label",
                `Time remaining: ${minutes} minutes and ${displaySeconds} seconds`);
        }
    }

    /**
     * Update game status and messages
     */
    updateGameStatus(status: UIState["gameStatus"], message: string): void {
        this.ensureInitialized();

        // Clear previous status classes
        this.elements.status.classList.remove("win", "loss");

        switch (status) {
            case "playing":
                this.elements.status.textContent = "";
                this.elements.status.setAttribute("aria-label", "Game in progress");
                this.hidePlayButton();
                break;

            case "paused":
                this.elements.status.textContent = "Game Paused";
                this.elements.status.setAttribute("aria-label", "Game is paused. Press space bar to resume.");
                this.showPlayButton("Press SPACE to resume!", "Game is paused. Press space bar to resume");
                break;

            case "win":
                this.elements.status.textContent = "YOU WIN!";
                this.elements.status.classList.add("win");
                this.elements.status.setAttribute("aria-label", "Game over: YOU WIN!");
                this.showPlayButton("Press SPACE to play again!", "Game ended. Press space bar to play again");
                break;

            case "lose":
                this.elements.status.textContent = "YOU LOSE!";
                this.elements.status.classList.add("loss");
                this.elements.status.setAttribute("aria-label", "Game over: YOU LOSE!");
                this.showPlayButton("Press SPACE to play again!", "Game ended. Press space bar to play again");
                break;

            case "ready":
                this.elements.status.textContent = "";
                this.elements.status.setAttribute("aria-label", "");
                this.showPlayButton("Press SPACE to play!", "Press space bar to start the game");
                break;
        }

        if (message) {
            this.elements.status.textContent = message;
        }
    }

    /**
     * Show the play button with message
     */
    private showPlayButton(text: string, ariaLabel: string): void {
        this.elements.playParent.classList.remove("hide");
        this.elements.play.textContent = text;
        this.elements.play.setAttribute("aria-label", ariaLabel);
    }

    /**
     * Hide the play button
     */
    private hidePlayButton(): void {
        this.elements.playParent.classList.add("hide");
    }

    /**
     * Update audio button state
     */
    updateAudioButton(enabled: boolean): void {
        this.ensureInitialized();

        const button = this.elements.audioToggle;
        button.textContent = enabled ? "🔊" : "🔇";
        button.setAttribute("aria-label", enabled ? "Mute sound effects" : "Unmute sound effects");

        if (enabled) {
            button.classList.remove("muted");
        }
        else {
            button.classList.add("muted");
        }
    }

    /**
     * Add click listener to audio button
     */
    addAudioToggleListener(callback: () => void): void {
        this.ensureInitialized();
        this.elements.audioToggle.addEventListener("click", callback);
    }

    /**
     * Focus the game canvas for keyboard interaction
     */
    focusCanvas(): void {
        this.ensureInitialized();
        this.elements.canvas.focus();
    }

    /**
     * Add event listener to canvas
     */
    addCanvasListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void {
        this.ensureInitialized();
        this.elements.canvas.addEventListener(type, listener, options);
    }

    /**
     * Remove event listener from canvas
     */
    removeCanvasListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => void,
        options?: boolean | EventListenerOptions
    ): void {
        this.ensureInitialized();
        this.elements.canvas.removeEventListener(type, listener, options);
    }

    /**
     * Ensure DOM manager is initialized before operations
     */
    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error("DOMManager not initialized. Call initialize() first.");
        }
    }

    /**
     * Reset UI to initial state
     */
    reset(): void {
        this.ensureInitialized();

        this.updateUI({
            score: 0,
            timeMinutes: 1,
            timeSeconds: 0,
            gameStatus: "ready",
            message: ""
        });
    }

    /**
     * Cleanup resources (if needed)
     */
    destroy(): void {
        this.isInitialized = false;
        // Additional cleanup if needed
    }

    /**
     * Initialize game UI to ready state
     */
    initializeGameUI(maxTimeSeconds: number): void {
        this.ensureInitialized();

        const minutes = Math.floor(maxTimeSeconds / 60);
        const seconds = maxTimeSeconds % 60;

        this.updateUI({
            score: 0,
            timeMinutes: minutes,
            timeSeconds: seconds,
            gameStatus: "ready",
            message: ""
        });
    }

    /**
     * Start game - update UI to playing state
     */
    startGameUI(maxTimeSeconds: number): void {
        this.ensureInitialized();

        this.updateGameStatus("playing", "");
        this.updateScore(0);
        this.updateTime(maxTimeSeconds);
    }

    /**
     * End game - update UI to win/lose state and focus canvas
     */
    endGameUI(won: boolean): void {
        this.ensureInitialized();

        this.updateGameStatus(won ? "win" : "lose", "");
        this.focusCanvas();
    }

    /**
     * Toggle pause state
     */
    togglePauseUI(paused: boolean): void {
        this.ensureInitialized();

        this.updateGameStatus(paused ? "paused" : "playing", paused ? "Game Paused" : "");
    }
}
