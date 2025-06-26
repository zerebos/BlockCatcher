/**
 * AudioManager - Simple audio system for game sound effects
 * Uses Web Audio API to generate procedural sounds
 */
import {MASTER_VOLUME} from "../config";

export default class AudioManager {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private enabled: boolean = true;

    constructor() {
        this.initializeAudio();
    }

    private initializeAudio(): void {
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
                if (this.masterGain) {
                    this.masterGain.gain.value = 0;
                }
                // Update UI after the state actually changes
                if (uiUpdateCallback) {
                    uiUpdateCallback(false);
                }
            }, 120);
            return false; // Will be muted after timeout
        }

        // Currently muted, about to unmute - unmute first then play feedback
        this.enabled = true;
        if (this.masterGain) {
            this.masterGain.gain.value = MASTER_VOLUME;
        }
        // Update UI immediately for unmuting
        if (uiUpdateCallback) {
            uiUpdateCallback(true);
        }
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

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create oscillator for the main tone
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Connect audio graph
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Configure sound based on block value
        const baseFreq = 440; // A4 note
        const freqMultiplier = 1 + (blockPoints / 25); // Higher pitch for higher value blocks
        oscillator.frequency.setValueAtTime(baseFreq * freqMultiplier, now);

        // Quick pitch bend upward for satisfying "pop" effect
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * freqMultiplier * 1.5, now + 0.1);

        // Volume envelope - quick attack, fast decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.exponentialRampToValueAtTime(0.8, now + 0.01); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15); // Decay

        // Use square wave for retro game feel
        oscillator.type = "square";

        // Play the sound
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    /**
     * Play game start sound
     */
    playGameStart(): void {
        if (!this.isEnabled() || !this.audioContext || !this.masterGain) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create a rising arpeggio
        const frequencies = [261.63, 329.63, 392.00]; // C, E, G major chord

        frequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain!); // We know it's not null here

            oscillator.frequency.setValueAtTime(freq, now);
            oscillator.type = "triangle";

            const startTime = now + (index * 0.1);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.3, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }

    /**
     * Play game over sound
     */
    playGameOver(): void {
        if (!this.isEnabled() || !this.audioContext || !this.masterGain) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create a descending tone for "sad trombone" effect
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Start high and slide down
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.8);

        // Longer, sadder envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.exponentialRampToValueAtTime(0.4, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        oscillator.type = "sawtooth";

        oscillator.start(now);
        oscillator.stop(now + 0.8);
    }

    /**
     * Play victory sound
     */
    playVictory(): void {
        if (!this.isEnabled() || !this.audioContext || !this.masterGain) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create a triumphant ascending melody
        const notes = [
            {freq: 523.25, time: 0}, // C5
            {freq: 659.25, time: 0.15}, // E5
            {freq: 783.99, time: 0.3}, // G5
            {freq: 1046.5, time: 0.45} // C6
        ];

        notes.forEach((note) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain!); // We know it's not null here

            oscillator.frequency.setValueAtTime(note.freq, now + note.time);
            oscillator.type = "triangle";

            const startTime = now + note.time;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.4, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.2);
        });
    }

    /**
     * Play mute/unmute feedback sound
     */
    private playMuteToggleSound(isMuting: boolean): void {
        if (!this.audioContext || !this.masterGain) return;

        // Only play if we're currently enabled (so we hear the mute sound)
        if (!this.enabled) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create a simple click/beep sound
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Different tones for mute vs unmute
        if (isMuting) {
            // Muting: descending tone (high to low)
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        }
        else {
            // Unmuting: ascending tone (low to high)
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        }

        // Quick, sharp envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.exponentialRampToValueAtTime(0.5, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        // Use square wave for crisp click
        oscillator.type = "square";

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }
}
