/**
 * AudioManager - Simple audio system for game sound effects
 * Uses Web Audio API to generate procedural sounds
 */
import {MASTER_VOLUME} from "../config";
import blockCatch from "../audio/block";
import gameOver from "../audio/gameover";
import gameStart from "../audio/gamestart";
import victory from "../audio/victory";
import toggleMute from "../audio/mute";

export default class AudioManager {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private volume: number = MASTER_VOLUME;
    private lastFeedbackTime: number = 0;

    constructor() {
        try {
            // Create audio context (will be suspended until user interaction)
            const AudioContextClass = window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;
            this.audioContext = new AudioContextClass();

            // Create master gain node for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.warn("Web Audio API not supported:", error);
        }
    }

    /**
     * Resume audio context (required after user interaction)
     */
    async resumeAudio(): Promise<void> {
        if (this.audioContext && this.audioContext.state === "suspended") {
            try {
                await this.audioContext.resume();
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.warn("Failed to resume audio context:", error);
            }
        }
    }

    /**
     * Set volume level (0-1)
     */
    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1

        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }

        // Play feedback sound when adjusting volume (except when setting to 0)
        // Use a softer, shorter beep that's more appropriate for volume adjustment
        // Throttle feedback to avoid excessive noise when dragging slider
        if (this.volume > 0 && this.audioContext && this.masterGain) {
            const now = Date.now();
            if (now - this.lastFeedbackTime > 50) { // Throttle to max once per 150ms
                this.playVolumeChangeFeedback();
                this.lastFeedbackTime = now;
            }
        }
    }

    /**
     * Get current volume level (0-1)
     */
    getVolume(): number {
        return this.volume;
    }

    /**
     * Check if audio is enabled (volume > 0)
     */
    isEnabled(): boolean {
        return this.volume > 0 && this.audioContext !== null;
    }

    /**
     * Play block catch sound - pitch varies based on block value
     */
    playBlockCatch(blockPoints: number): void {
        if (!this.isEnabled() || !this.audioContext || !this.masterGain) return;
        blockCatch(this.audioContext, this.masterGain, blockPoints);
    }

    /**
     * Play game start sound
     */
    playGameStart(): void {
        if (!this.isEnabled() || !this.audioContext || !this.masterGain) return;
        gameStart(this.audioContext, this.masterGain);
    }

    /**
     * Play game over sound
     */
    playGameOver(): void {
        if (!this.isEnabled() || !this.audioContext || !this.masterGain) return;
        gameOver(this.audioContext, this.masterGain);
    }

    /**
     * Play victory sound
     */
    playVictory(): void {
        if (!this.isEnabled() || !this.audioContext || !this.masterGain) return;
        victory(this.audioContext, this.masterGain);
    }

    /**
     * Play a brief volume change feedback sound
     */
    private playVolumeChangeFeedback(): void {
        if (!this.audioContext || !this.masterGain) return;
        return toggleMute(this.audioContext, this.masterGain, false);
    }
}
