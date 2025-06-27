/**
 * Play victory sound
 */
export default function victory(ctx: AudioContext, gain: GainNode) {
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
        gainNode.connect(gain); // We know it's not null here

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