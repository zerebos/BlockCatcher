/**
 * AudioManager - Simple audio system for game sound effects
 * Uses Web Audio API to generate procedural sounds
 */
import {MASTER_VOLUME} from "../config";
import blockCatch from "../audio/block";
import gameOver from "../audio/gameover";
import gameStart from "../audio/gamestart";
import toggleMute from "../audio/mute";
import victory from "../audio/victory";

export default class AudioManager {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private enabled: boolean = true;

    constructor() {
        try {
            // Create audio context (will be suspended until user interaction)
            const AudioContextClass = window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;
            this.audioContext = new AudioContextClass();

            // Create master gain node for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = MASTER_VOLUME; // Default volume
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.warn("Web Audio API not supported:", error);
            this.enabled = false;
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
     * Toggle audio on/off with audio feedback
     * Returns the final state, and optionally takes a callback for UI updates
     */
    toggleMute(uiUpdateCallback?: (enabled: boolean) => void): boolean {
        // Play feedback sound before changing state (so we can hear it when muting)
        if (this.enabled) {
            // Currently enabled, about to mute - play feedback first
            this.playMuteToggleSound(true);
            // Delay the actual muting so we can hear the feedback
            setTimeout(() => {
                this.enabled = false;
                if (this.masterGain) this.masterGain.gain.value = 0;
                // Update UI after the state actually changes
                uiUpdateCallback?.(false);
            }, 120);
            return false; // Will be muted after timeout
        }

        // Currently muted, about to unmute - unmute first then play feedback
        this.enabled = true;
        if (this.masterGain) this.masterGain.gain.value = MASTER_VOLUME;

        // Update UI immediately for unmuting
        uiUpdateCallback?.(true);

        // Small delay to ensure audio system is ready
        setTimeout(() => {
            this.playMuteToggleSound(false);
        }, 10);
        return true;
    }

    /**
     * Check if audio is enabled
     */
    isEnabled(): boolean {
        return this.enabled && this.audioContext !== null;
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
     * Play mute/unmute feedback sound
     */
    private playMuteToggleSound(isMuting: boolean): void {
        if (!this.audioContext || !this.masterGain) return;

        // Only play if we're currently enabled (so we hear the mute sound)
        if (!this.enabled) return;

        toggleMute(this.audioContext, this.masterGain, isMuting);
    }
}
