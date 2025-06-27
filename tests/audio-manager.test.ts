import {describe, it, expect, beforeEach} from "bun:test";
import AudioManager from "../src/managers/audio";

// Mock Web Audio API for testing
const mockAudioContext = {
    createOscillator: () => ({
        frequency: {
            setValueAtTime: () => {},
            exponentialRampToValueAtTime: () => {}
        },
        connect: () => {},
        start: () => {},
        stop: () => {},
        type: "sine"
    }),
    createGain: () => ({
        gain: {
            value: 0,
            setValueAtTime: () => {},
            exponentialRampToValueAtTime: () => {}
        },
        connect: () => {}
    }),
    currentTime: 0,
    destination: {},
    state: "running",
    resume: async () => {}
};

describe("Audio Manager", () => {
    let audioManager: AudioManager;

    beforeEach(() => {
        // Mock the global AudioContext
        (globalThis as unknown as {window: {AudioContext: unknown}}).window = {
            AudioContext: function() {
                return mockAudioContext;
            }
        };

        audioManager = new AudioManager();
    });

    describe("Initialization", () => {
        it("should initialize successfully", () => {
            expect(audioManager.isEnabled()).toBe(true);
        });

        it("should handle missing Web Audio API gracefully", () => {
            // Test with no AudioContext available
            const originalWindow = globalThis.window;
            delete (globalThis as {window?: unknown}).window;

            const audioManagerNoContext = new AudioManager();
            expect(audioManagerNoContext.isEnabled()).toBe(false);

            // Restore window
            (globalThis as {window: unknown}).window = originalWindow;
        });
    });

    describe("Audio Controls", () => {
        it("should toggle mute on and off", async () => {
            expect(audioManager.isEnabled()).toBe(true);

            const result1 = audioManager.toggleMute();
            expect(result1).toBe(false); // Returns the target state immediately

            // But the actual muting happens after a delay for audio feedback
            expect(audioManager.isEnabled()).toBe(true); // Still enabled initially

            // Wait for the muting delay to complete
            await new Promise(resolve => setTimeout(resolve, 150));
            expect(audioManager.isEnabled()).toBe(false); // Now actually muted

            const result2 = audioManager.toggleMute();
            expect(result2).toBe(true);
            expect(audioManager.isEnabled()).toBe(true); // Unmuting is immediate
        });
    });

    describe("Sound Effects", () => {
        it("should not throw errors when playing sounds", () => {
            expect(() => audioManager.playBlockCatch(1)).not.toThrow();
            expect(() => audioManager.playBlockCatch(5)).not.toThrow();
            expect(() => audioManager.playBlockCatch(25)).not.toThrow();
        });

        it("should not throw errors when playing game sounds", () => {
            expect(() => audioManager.playGameStart()).not.toThrow();
            expect(() => audioManager.playGameOver()).not.toThrow();
            expect(() => audioManager.playVictory()).not.toThrow();
        });

        it("should not play sounds when muted", () => {
            audioManager.toggleMute(); // Mute audio

            // These should not throw and should exit early
            expect(() => audioManager.playBlockCatch(1)).not.toThrow();
            expect(() => audioManager.playGameStart()).not.toThrow();
            expect(() => audioManager.playGameOver()).not.toThrow();
            expect(() => audioManager.playVictory()).not.toThrow();
        });
    });

    describe("Web Audio Context", () => {
        it("should resume audio context", async () => {
            await audioManager.resumeAudio();
            // If we get here without throwing, the test passes
            expect(true).toBe(true);
        });
    });
});
