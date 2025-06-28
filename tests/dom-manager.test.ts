import {describe, it, expect, beforeEach, afterEach} from "bun:test";
import {Window} from "happy-dom";
import DOMManager from "../src/managers/dom";
import {readFileSync} from "fs";
import {join} from "path";


describe("DOM Manager", () => {
    let window: Window;
    let domManager: DOMManager;

    beforeEach(() => {
        // Create a new DOM window for each test
        window = new Window();

        // Load the actual HTML file
        const htmlPath = join(__dirname, "../src/index.html");
        const htmlContent = readFileSync(htmlPath, "utf-8");

        // Set up the DOM with the actual HTML
        window.document.documentElement.innerHTML = htmlContent;

        // Set global references for the DOM manager
        (globalThis as any).document = window.document; // eslint-disable-line @typescript-eslint/no-explicit-any
        (globalThis as any).window = window; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Create a fresh DOM manager instance
        domManager = new DOMManager();
    });

    afterEach(() => {
        // Clean up global references
        delete (globalThis as any).document; // eslint-disable-line @typescript-eslint/no-explicit-any
        delete (globalThis as any).window; // eslint-disable-line @typescript-eslint/no-explicit-any
        window.close();
    });

    describe("Initialization", () => {
        it("should initialize successfully with real DOM elements", () => {
            const result = domManager.initialize();
            expect(result).toBe(true);
            expect(domManager.isReady()).toBe(true);
        });

        it("should find all required DOM elements", () => {
            domManager.initialize();

            // Verify all elements exist
            expect(window.document.getElementById("gl-canvas")).toBeTruthy();
            expect(window.document.getElementById("score")).toBeTruthy();
            expect(window.document.getElementById("time")).toBeTruthy();
            expect(window.document.getElementById("status")).toBeTruthy();
            expect(window.document.getElementById("play")).toBeTruthy();
            expect(window.document.getElementById("volume-slider")).toBeTruthy();
        });

        it("should get canvas element after initialization", () => {
            domManager.initialize();
            const canvas = domManager.getCanvas();
            expect(canvas).toBeTruthy();
            expect(canvas.tagName).toBe("CANVAS");
        });
    });

    describe("UI Updates", () => {
        beforeEach(() => {
            domManager.initialize();
        });

        it("should update score with aria-label", () => {
            const scoreElement = window.document.getElementById("score")!;

            domManager.updateScore(250);

            expect(scoreElement.textContent).toBe("250");
            expect(scoreElement.getAttribute("aria-label")).toBe("Current score: 250 points");
        });

        it("should update time display correctly", () => {
            const timeElement = window.document.getElementById("time")!;

            domManager.updateTime(1, 30);

            expect(timeElement.textContent).toBe("01:30");
        });

        it("should update time with fractional seconds", () => {
            const timeElement = window.document.getElementById("time")!;

            // Test the new overloaded method that handles fractional seconds
            domManager.updateTime(65.7); // 1 minute, 5.7 seconds -> should show 01:06

            expect(timeElement.textContent).toBe("01:06");
        });

        it("should add time warning for low time", () => {
            const timeElement = window.document.getElementById("time")!;

            domManager.updateTime(0, 5); // 5 seconds remaining

            expect(timeElement.classList.contains("time-warning")).toBe(true);
        });

        it("should remove time warning for normal time", () => {
            const timeElement = window.document.getElementById("time")!;

            // First add warning
            domManager.updateTime(0, 5);
            expect(timeElement.classList.contains("time-warning")).toBe(true);

            // Then remove it
            domManager.updateTime(0, 15);
            expect(timeElement.classList.contains("time-warning")).toBe(false);
        });

        it("should update game status for win condition", () => {
            const statusElement = window.document.getElementById("status")!;
            const playElement = window.document.getElementById("play")!;

            domManager.updateGameStatus("win", "");

            expect(statusElement.textContent).toBe("YOU WIN!");
            expect(statusElement.classList.contains("win")).toBe(true);
            expect(statusElement.getAttribute("aria-label")).toBe("Game over: YOU WIN!");
            expect(playElement.parentElement!.classList.contains("hide")).toBe(false);
        });

        it("should update game status for lose condition", () => {
            const statusElement = window.document.getElementById("status")!;

            domManager.updateGameStatus("lose", "");

            expect(statusElement.textContent).toBe("YOU LOSE!");
            expect(statusElement.classList.contains("loss")).toBe(true);
            expect(statusElement.getAttribute("aria-label")).toBe("Game over: YOU LOSE!");
        });

        it("should update game status for playing state", () => {
            const statusElement = window.document.getElementById("status")!;
            const playElement = window.document.getElementById("play")!;

            domManager.updateGameStatus("playing", "");

            expect(statusElement.textContent).toBe("");
            expect(statusElement.getAttribute("aria-label")).toBe("Game in progress");
            expect(playElement.parentElement!.classList.contains("hide")).toBe(true);
        });

        it("should focus canvas", () => {
            const canvas = document.getElementById("gl-canvas")! as HTMLCanvasElement;

            domManager.focusCanvas();

            expect(window.document.activeElement as unknown).toBe(canvas);
        });

        it("should update volume slider and icon", () => {
            const volumeSlider = document.getElementById("volume-slider")! as HTMLInputElement;
            const volumeIcon = document.getElementById("volume-icon")!;

            // Test volume at 80%
            domManager.updateVolumeSlider(80);
            expect(volumeSlider.value).toBe("80");
            expect(volumeIcon.textContent).toBe("🔊");
            expect(volumeIcon.classList.contains("muted")).toBe(false);

            // Test volume at 50% (medium)
            domManager.updateVolumeSlider(50);
            expect(volumeSlider.value).toBe("50");
            expect(volumeIcon.textContent).toBe("🔉");
            expect(volumeIcon.classList.contains("muted")).toBe(false);

            // Test volume at 20% (low)
            domManager.updateVolumeSlider(20);
            expect(volumeSlider.value).toBe("20");
            expect(volumeIcon.textContent).toBe("🔈");
            expect(volumeIcon.classList.contains("muted")).toBe(false);

            // Test volume at 0% (muted)
            domManager.updateVolumeSlider(0);
            expect(volumeSlider.value).toBe("0");
            expect(volumeIcon.textContent).toBe("🔇");
            expect(volumeIcon.classList.contains("muted")).toBe(true);
        });
    });

    describe("State Management", () => {
        beforeEach(() => {
            domManager.initialize();
        });

        it("should update complete UI state", () => {
            const scoreElement = window.document.getElementById("score")!;
            const timeElement = window.document.getElementById("time")!;
            const statusElement = window.document.getElementById("status")!;

            domManager.updateUI({
                score: 100,
                timeMinutes: 0,
                timeSeconds: 45,
                gameStatus: "playing",
                message: ""
            });

            expect(scoreElement.textContent).toBe("100");
            expect(timeElement.textContent).toBe("00:45");
            expect(statusElement.getAttribute("aria-label")).toBe("Game in progress");
        });

        it("should initialize game UI correctly", () => {
            const scoreElement = window.document.getElementById("score")!;
            const timeElement = window.document.getElementById("time")!;
            const statusElement = window.document.getElementById("status")!;

            domManager.initializeGameUI(60); // 1 minute

            expect(scoreElement.textContent).toBe("0");
            expect(timeElement.textContent).toBe("01:00");
            expect(statusElement.textContent).toBe("");
        });

        it("should start game UI correctly", () => {
            const scoreElement = window.document.getElementById("score")!;
            const timeElement = window.document.getElementById("time")!;
            const statusElement = window.document.getElementById("status")!;

            domManager.startGameUI(30); // 30 seconds

            expect(scoreElement.textContent).toBe("0");
            expect(timeElement.textContent).toBe("00:30");
            expect(statusElement.getAttribute("aria-label")).toBe("Game in progress");
        });

        it("should end game UI correctly", () => {
            const statusElement = window.document.getElementById("status")!;
            const canvas = window.document.getElementById("gl-canvas")!;

            domManager.endGameUI(true); // Won

            expect(statusElement.textContent).toBe("YOU WIN!");
            expect(statusElement.classList.contains("win")).toBe(true);
            expect(window.document.activeElement as unknown).toBe(canvas);
        });

        it("should toggle pause UI correctly", () => {
            const statusElement = window.document.getElementById("status")!;

            // Test pausing
            domManager.togglePauseUI(true);
            expect(statusElement.textContent).toBe("Game Paused");

            // Test unpausing
            domManager.togglePauseUI(false);
            expect(statusElement.getAttribute("aria-label")).toBe("Game in progress");
        });
    });

    describe("Event Management", () => {
        beforeEach(() => {
            domManager.initialize();
        });

        it("should add volume change listener", () => {
            let callbackCalled = false;
            let receivedVolume = 0;
            const callback = (volume: number) => {
                callbackCalled = true;
                receivedVolume = volume;
            };

            domManager.addVolumeChangeListener(callback);

            // Simulate volume change
            const volumeSlider: HTMLInputElement = window.document.getElementById("volume-slider") as unknown as HTMLInputElement;
            volumeSlider.value = "75";
            volumeSlider.dispatchEvent(new Event("input"));

            expect(callbackCalled).toBe(true);
            expect(receivedVolume).toBe(75);
        });

        it("should add canvas event listeners", () => {
            let eventFired = false;
            const listener = () => {eventFired = true;};

            domManager.addCanvasListener("click", listener);

            // Simulate click
            const canvas = window.document.getElementById("gl-canvas") as unknown as HTMLCanvasElement;
            canvas.click();

            expect(eventFired).toBe(true);
        });
    });
});
