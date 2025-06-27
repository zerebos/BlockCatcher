/**
 * Play game start sound
 */
export default function gameStart(ctx: AudioContext, gain: GainNode) {
     const now = ctx.currentTime;

    // Create a rising arpeggio
    const frequencies = [261.63, 329.63, 392.00]; // C, E, G major chord

    frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(gain); // We know it's not null here

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