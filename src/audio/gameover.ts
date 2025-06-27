/**
 * Play game over sound
 */
export default function gameOver(ctx: AudioContext, gain: GainNode) {
    const now = ctx.currentTime;

    // Create a descending tone for "sad trombone" effect
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(gain);

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