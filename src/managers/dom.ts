/**
 * DOM Manager - Abstracts DOM operations for the game
 * Provides a clean interface for UI updates and element management
 */

import type {GameElements, UIState} from "../types";
import type {LeaderboardEntry} from "../leaderboard/types";

export default class DOMManager {
    private elements: GameElements;
    private isInitialized = false;

    // Leaderboard elements (initialized alongside the main elements)
    private leaderboardOverlay!: HTMLElement;
    private leaderboardNameEntry!: HTMLElement;
    private leaderboardResult!: HTMLElement;
    private leaderboardForm!: HTMLFormElement;
    private playerNameInput!: HTMLInputElement;
    private leaderboardTableWrap!: HTMLElement;
    private leaderboardBody!: HTMLElement;
    private leaderboardLoading!: HTMLElement;

    // Handlers set by the game; called by the one-time DOM listeners below
    private leaderboardSubmitHandler: ((name: string) => void) | null = null;
    private leaderboardSkipHandler: (() => void) | null = null;

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
            this.elements.audioToggle = this.getElement<HTMLInputElement>("volume-slider");

            // Leaderboard elements
            this.leaderboardOverlay = this.getElement("leaderboard-overlay");
            this.leaderboardNameEntry = this.getElement("leaderboard-name-entry");
            this.leaderboardResult = this.getElement("leaderboard-result");
            this.leaderboardForm = this.getElement<HTMLFormElement>("leaderboard-form");
            this.playerNameInput = this.getElement<HTMLInputElement>("player-name");
            this.leaderboardTableWrap = this.getElement("leaderboard-table-wrap");
            this.leaderboardBody = this.getElement("leaderboard-body");
            this.leaderboardLoading = this.getElement("leaderboard-loading");

            // Wire up leaderboard form/button once; handlers are set later via setLeaderboardHandlers
            this.leaderboardForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const name = this.playerNameInput.value.trim() || "Player";
                if (this.leaderboardSubmitHandler) this.leaderboardSubmitHandler(name);
            });

            this.getElement("leaderboard-skip").addEventListener("click", () => {
                if (this.leaderboardSkipHandler) this.leaderboardSkipHandler();
            });

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
     * Update volume slider value
     */
    updateVolumeSlider(volume: number): void {
        this.ensureInitialized();
        const slider = this.elements.audioToggle as HTMLInputElement;
        slider.value = volume.toString();
        this.updateVolumeIcon(volume);
    }

    /**
     * Update volume icon based on volume level
     */
    updateVolumeIcon(volume: number): void {
        this.ensureInitialized();
        const icon = document.getElementById("volume-icon");
        if (icon) {
            // Show different icons based on volume level
            if (volume === 0) {
                icon.textContent = "🔇"; // Muted
            }
            else if (volume < 30) {
                icon.textContent = "🔈"; // Low volume
            }
            else if (volume < 70) {
                icon.textContent = "🔉"; // Medium volume
            }
            else {
                icon.textContent = "🔊"; // High volume
            }
            icon.classList.toggle("muted", volume === 0);
        }
    }

    /**
     * Add change listener to volume slider
     */
    addVolumeChangeListener(callback: (volume: number) => void): void {
        this.ensureInitialized();
        const slider = this.elements.audioToggle as HTMLInputElement;

        // Handle both input (real-time) and change (final value) events
        const handleVolumeChange = () => {
            const volume = parseInt(slider.value, 10);
            callback(volume);
        };

        slider.addEventListener("input", handleVolumeChange);
        slider.addEventListener("change", handleVolumeChange);
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

    // ─── Leaderboard ──────────────────────────────────────────────────────────

    /**
     * Register callbacks invoked by the name-entry form.
     * Must be called before showLeaderboardNameEntry().
     */
    setLeaderboardHandlers(
        onSubmit: (name: string) => void,
        onSkip: () => void
    ): void {
        this.leaderboardSubmitHandler = onSubmit;
        this.leaderboardSkipHandler = onSkip;
    }

    /**
     * Show the name-entry phase of the leaderboard overlay.
     * @param result      Short summary shown above the form (e.g. "YOU WIN! • 350 pts").
     * @param defaultName Pre-fill the input with the last used name.
     */
    showLeaderboardNameEntry(result: string, defaultName: string): void {
        this.ensureInitialized();

        this.leaderboardResult.textContent = result;
        this.playerNameInput.value = defaultName;

        // Show entry panel, hide table panel
        this.leaderboardNameEntry.classList.remove("hide");
        this.leaderboardTableWrap.classList.add("hide");
        this.leaderboardLoading.classList.add("hide");

        // Show overlay; also hide the existing game overlay so it doesn't
        // bleed through (leaderboard overlay is later in the DOM so sits on
        // top, but explicit hiding avoids ARIA confusion).
        this.leaderboardOverlay.classList.remove("hide");
        this.elements.playParent.classList.add("hide");

        // Focus the name input for immediate keyboard entry
        this.playerNameInput.focus();
        this.playerNameInput.select();
    }

    /**
     * Show the loading spinner while entries are being fetched.
     * Switches to the table panel with only the spinner visible.
     */
    showLeaderboardLoading(): void {
        this.ensureInitialized();

        this.leaderboardNameEntry.classList.add("hide");
        this.leaderboardTableWrap.classList.remove("hide");
        this.leaderboardLoading.classList.remove("hide");
        this.leaderboardBody.innerHTML = "";
    }

    /**
     * Populate and display the score table.
     * @param entries     Sorted entries to display (from LeaderboardManager.getEntries).
     * @param highlightId UUID of the entry just saved; that row gets the .highlight class.
     */
    showLeaderboardTable(entries: LeaderboardEntry[], highlightId?: string): void {
        this.ensureInitialized();

        this.leaderboardLoading.classList.add("hide");
        this.leaderboardNameEntry.classList.add("hide");
        this.leaderboardTableWrap.classList.remove("hide");

        this.leaderboardBody.innerHTML = "";

        if (entries.length === 0) {
            const row = document.createElement("tr");
            row.className = "empty-row";
            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.textContent = "No scores yet — be the first!";
            row.appendChild(cell);
            this.leaderboardBody.appendChild(row);
            return;
        }

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const row = document.createElement("tr");
            if (highlightId && entry.id === highlightId) row.classList.add("highlight");

            const rankCell = document.createElement("td");
            const nameCell = document.createElement("td");
            const scoreCell = document.createElement("td");
            const timeCell = document.createElement("td");

            rankCell.textContent = String(i + 1);
            nameCell.textContent = entry.name;
            scoreCell.textContent = String(entry.score);
            timeCell.textContent = this.formatTime(entry.timeRemaining);

            row.append(rankCell, nameCell, scoreCell, timeCell);
            this.leaderboardBody.appendChild(row);
        }
    }

    /** Hide the leaderboard overlay entirely. */
    hideLeaderboard(): void {
        this.ensureInitialized();
        this.leaderboardOverlay.classList.add("hide");
    }

    /** Return true if the leaderboard overlay is currently visible. */
    isLeaderboardVisible(): boolean {
        this.ensureInitialized();
        return !this.leaderboardOverlay.classList.contains("hide");
    }

    /**
     * Return true when the score table (not the name-entry form) is showing.
     * Used by game.ts to decide whether SPACE should start a new game.
     */
    isLeaderboardTableVisible(): boolean {
        this.ensureInitialized();
        return (
            this.isLeaderboardVisible()
            && !this.leaderboardTableWrap.classList.contains("hide")
        );
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /** Format a seconds value as MM:SS. */
    private formatTime(totalSeconds: number): string {
        const s = Math.ceil(Math.max(0, totalSeconds));
        const m = Math.floor(s / 60);
        const rem = s % 60;
        return `${m < 10 ? "0" + m : m}:${rem < 10 ? "0" + rem : rem}`;
    }
}
