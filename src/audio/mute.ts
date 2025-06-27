/**
 * Play mute/unmute toggle sound
 */
export default function toggleMute(ctx: AudioContext, gain: GainNode, isMuting: boolean) {
    const now = ctx.currentTime;

    // Create a simple click/beep sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(gain);

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