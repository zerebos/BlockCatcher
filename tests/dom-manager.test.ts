import {describe, it, expect, beforeEach} from "bun:test";
import DOMManager from "../src/utils/dom-manager";

// Mock DOM for testing
const mockDoc = {
    getElementById: (id: string) => {
        const elements: Record<string, any> = {
            "gl-canvas": {
                focus: () => {
                    (elements["gl-canvas"] as any).focused = true;
                },
                setAttribute: () => {},
                getAttribute: () => null,
                focused: false,
                addEventListener: () => {},
                removeEventListener: () => {}
            },
            "score": {
                textContent: "0",
                setAttribute: (attr: string, value: string) => {
                    if (attr === "aria-label") (elements.score as any).ariaLabel = value;
                },
                getAttribute: () => null,
                ariaLabel: ""
            },
            "time": {
                textContent: "01:00",
                setAttribute: (attr: string, value: string) => {
                    if (attr === "aria-label") (elements.time as any).ariaLabel = value;
                },
                getAttribute: () => null,
                ariaLabel: ""
            },
            "status": {
                textContent: "",
                setAttribute: (attr: string, value: string) => {
                    if (attr === "aria-label") (elements.status as any).ariaLabel = value;
                },
                getAttribute: () => null,
                classList: {
                    add: (className: string) => {
                        (elements.status as any).className = className;
                    },
                    remove: () => {
                        (elements.status as any).className = "";
                    }
                },
                ariaLabel: "",
                className: ""
            },
            "play": {
                textContent: "Press SPACE to play!",
                setAttribute: (attr: string, value: string) => {
                    if (attr === "aria-label") (elements.play as any).ariaLabel = value;
                },
                getAttribute: () => null,
                parentElement: {
                    classList: {
                        add: () => {
                            (elements.play as any).parentHidden = true;
                        },
                        remove: () => {
                            (elements.play as any).parentHidden = false;
                        }
                    }
                },
                ariaLabel: "",
                parentHidden: false
            },
            "audio-toggle": {
                textContent: "🔊",
                setAttribute: (attr: string, value: string) => {
                    if (attr === "aria-label") (elements["audio-toggle"] as Record<string, unknown>).ariaLabel = value;
                },
                getAttribute: () => null,
                addEventListener: () => {},
                classList: {
                    add: (className: string) => {
                        (elements["audio-toggle"] as Record<string, unknown>).className = className;
                    },
                    remove: (_className: string) => {
                        (elements["audio-toggle"] as Record<string, unknown>).className = "";
                    }
                },
                ariaLabel: "",
                className: ""
            }
        };
        return elements[id] || null;
    }
};

(globalThis as any).document = mockDoc;

describe("DOM Manager", () => {
    let domManager: DOMManager;

    beforeEach(() => {
        domManager = new DOMManager();
    });

    describe("Initialization", () => {
        it("should initialize successfully with valid DOM elements", () => {
            const result = domManager.initialize();
            expect(result).toBe(true);
            expect(domManager.isReady()).toBe(true);
        });

        it("should get canvas element after initialization", () => {
            domManager.initialize();
            const canvas = domManager.getCanvas();
            expect(canvas).toBeDefined();
        });
    });

    describe("UI Updates", () => {
        beforeEach(() => {
            domManager.initialize();
        });

        it("should update score with aria-label", () => {
            const scoreElement = mockDoc.getElementById("score") as any;

            domManager.updateScore(250);

            expect(scoreElement.textContent).toBe("250");
            expect(scoreElement.ariaLabel).toBe("Current score: 250 points");
        });

        it("should update time display correctly", () => {
            const timeElement = mockDoc.getElementById("time") as any;

            domManager.updateTime(1, 30);

            expect(timeElement.textContent).toBe("01:30");
        });

        it("should update game status for win condition", () => {
            const statusElement = mockDoc.getElementById("status") as any;
            const playElement = mockDoc.getElementById("play") as any;

            domManager.updateGameStatus("win", "");

            expect(statusElement.textContent).toBe("YOU WIN!");
            expect(statusElement.className).toBe("win");
            expect(statusElement.ariaLabel).toBe("Game over: YOU WIN!");
            expect(playElement.parentHidden).toBe(false);
        });

        it("should focus canvas", () => {
            const canvas = mockDoc.getElementById("gl-canvas") as any;

            domManager.focusCanvas();

            expect(canvas.focused).toBe(true);
        });
    });

    describe("State Management", () => {
        beforeEach(() => {
            domManager.initialize();
        });

        it("should update complete UI state", () => {
            const scoreElement = mockDoc.getElementById("score") as any;
            const timeElement = mockDoc.getElementById("time") as any;
            const statusElement = mockDoc.getElementById("status") as any;

            domManager.updateUI({
                score: 100,
                timeMinutes: 0,
                timeSeconds: 45,
                gameStatus: "playing",
                message: ""
            });

            expect(scoreElement.textContent).toBe("100");
            expect(timeElement.textContent).toBe("00:45");
            expect(statusElement.ariaLabel).toBe("Game in progress");
        });
    });
});
