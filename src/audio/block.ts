/**
 * Play block catch sound - pitch varies based on block value
 */
export default function blockCatch(ctx: AudioContext, gain: GainNode, blockPoints: number) {
    const now = ctx.currentTime;

    // Create oscillator for the main tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Connect audio graph
    oscillator.connect(gainNode);
    gainNode.connect(gain);

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