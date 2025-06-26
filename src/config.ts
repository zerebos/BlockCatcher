export const SCORE_THRESHOLD = "hot" in import.meta ? 500 : 500;
export const MAX_SECONDS = "hot" in import.meta ? 10 : 60;
export const BLOCK_INTERVAL = "hot" in import.meta ? 100 : 1000;
export const MASTER_VOLUME = 0.6;
export const PLAYER_COLOR = [0, 1, 0];
export const BG_COLOR = [0, 0, 0];
export const BLOCKS = [
    {
        color: [1, 0, 0],
        speed: 1,
        size: 2.5,
        points: 1
    },
    {
        color: [0, 0, 1],
        speed: 2,
        size: 1.5,
        points: 5
    },
    {
        color: [1, 1, 1],
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