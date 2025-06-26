// Vector types for math operations
export type Vec = number[] | Vec2 | Vec3 | Vec4;
export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

// Game state types
export type GameStatus = "playing" | "paused" | "win" | "lose" | "ready";

// UI and DOM types
export interface GameElements {
    canvas: HTMLCanvasElement;
    score: HTMLElement;
    time: HTMLElement;
    status: HTMLElement;
    play: HTMLElement;
    playParent: HTMLElement;
    audioToggle: HTMLButtonElement;
}

export interface UIState {
    score: number;
    timeMinutes: number;
    timeSeconds: number;
    gameStatus: GameStatus;
    message: string;
}

// Object pooling types
export interface Poolable {
    /**
     * Reset the object to its initial state for reuse
     */
    reset(): void;

    /**
     * Check if the object is currently active/in-use
     */
    isActive(): boolean;

    /**
     * Prepare the object for being returned to the pool (optional)
     */
    prepareForPool?(): void;
}