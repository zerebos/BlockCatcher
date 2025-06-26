export const SCORE_THRESHOLD = "hot" in import.meta ? 25 : 500;
export const MAX_SECONDS = "hot" in import.meta ? 10 : 60;
export const BLOCK_INTERVAL = "hot" in import.meta ? 1000 : 1000;
export const MASTER_VOLUME = 0.6;
export const PLAYER_COLOR = [1.0, 1.0, 1.0]; // White player
export const BG_COLOR = [0, 0, 0];
export const BLOCKS = [
    {
        color: [1.0, 0.0, 0.5], // Pink blocks (large, slow, easy)
        speed: 1,
        size: 2.5,
        points: 1
    },
    {
        color: [0.6, 0.2, 0.8], // Purple blocks (medium, gradient middle)
        speed: 2,
        size: 1.5,
        points: 5
    },
    {
        color: [0.0, 1.0, 1.0], // Cyan blocks (small, fast, hard)
        speed: 3,
        size: 1,
        points: 25
    },
    // {
    //     color: [1, 1, 0],
    //     speed: 5,
    //     size: 0.5,
    //     points: 50
    // },
];

/**
 * Creates a darker version of a color for stroke effects
 * @param color - RGB color array [r, g, b] with values 0-1
 * @param factor - Darkening factor (0.7 = 30% darker)
 * @returns Darker version of the color
 */
export function darkenColor(color: number[], factor: number = 0.7): number[] {
    return [
        Math.max(0, color[0] * factor),
        Math.max(0, color[1] * factor),
        Math.max(0, color[2] * factor)
    ];
}