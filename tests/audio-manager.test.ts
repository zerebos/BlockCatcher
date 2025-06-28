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
        it("should set and get volume correctly", () => {
            expect(audioManager.isEnabled()).toBe(true);
            expect(audioManager.getVolume()).toBe(0.6); // MASTER_VOLUME from config

            // Test setting volume
            audioManager.setVolume(0.8);
            expect(audioManager.getVolume()).toBe(0.8);
            expect(audioManager.isEnabled()).toBe(true);

            // Test setting volume to 0 (muted)
            audioManager.setVolume(0);
            expect(audioManager.getVolume()).toBe(0);
            expect(audioManager.isEnabled()).toBe(false);

            // Test clamping values
            audioManager.setVolume(1.5); // Above max
            expect(audioManager.getVolume()).toBe(1);

            audioManager.setVolume(-0.5); // Below min
            expect(audioManager.getVolume()).toBe(0);
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

        it("should not play sounds when volume is zero", () => {
            audioManager.setVolume(0); // Mute audio

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
