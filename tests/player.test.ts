import {describe, it, expect, beforeEach} from "bun:test";
import Player from "../src/player";
import type Renderer from "../src/utils/renderer";

// Mock renderer for testing
const mockRenderer: Pick<Renderer, "createBuffer"> = {
    createBuffer: () => ({} as WebGLBuffer)
};

describe("Player", () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(mockRenderer as Renderer);
    });

    describe("constructor", () => {
        it("should initialize with correct starting position", () => {
            expect(player.shiftX).toBe(0);
            expect(player.velocity).toBe(0);
            expect(player.deltaTrans).toBe(0.03);
        });

        it("should create player with correct dimensions", () => {
            expect(player.width).toBeCloseTo(0.3, 10); // 0.15 - (-0.15)
            expect(player.height).toBeCloseTo(0.05, 10); // -0.925 - (-0.975)
        });

        it("should have correct initial position", () => {
            expect(player.x).toBe(-0.15);
            expect(player.y).toBe(-0.925);
        });
    });

    describe("uniforms", () => {
        it("should return correct uniform values", () => {
            const uniforms = player.uniforms;
            expect(uniforms.xshift).toBe(0);
            expect(uniforms.yshift).toBe(0);
            expect(uniforms.color).toEqual([0, 1, 0]); // Green color
        });

        it("should update xshift uniform when player moves", () => {
            player.shiftX = 0.5;
            const uniforms = player.uniforms;
            expect(uniforms.xshift).toBe(0.5);
        });
    });

    describe("movement", () => {
        it("should move right when direction is 1", () => {
            const initialX = player.x;
            player.step(25, 1); // Standard timestep of 25ms

            expect(player.x).toBeGreaterThan(initialX);
            expect(player.shiftX).toBeGreaterThan(0);
        });

        it("should move left when direction is -1", () => {
            const initialX = player.x;
            player.step(25, -1); // Standard timestep of 25ms

            expect(player.x).toBeLessThan(initialX);
            expect(player.shiftX).toBeLessThan(0);
        });

        it("should not move when direction is 0", () => {
            const initialX = player.x;
            const initialShiftX = player.shiftX;
            player.step(25, 0);

            expect(player.x).toBe(initialX);
            expect(player.shiftX).toBe(initialShiftX);
        });

        it("should respect left boundary", () => {
            // Move far left to test boundary
            for (let i = 0; i < 100; i++) {
                player.step(25, -1);
            }

            expect(player.x).toBeGreaterThanOrEqual(-1.01);
        });

        it("should respect right boundary", () => {
            // Move far right to test boundary
            for (let i = 0; i < 100; i++) {
                player.step(25, 1);
            }

            expect(player.x + player.width).toBeLessThan(1.01);
        });

        it("should scale movement with timestep", () => {
            const player1 = new Player(mockRenderer as Renderer);
            const player2 = new Player(mockRenderer as Renderer);

            player1.step(25, 1); // Normal timestep
            player2.step(50, 1); // Double timestep

            expect(Math.abs(player2.shiftX)).toBeGreaterThan(Math.abs(player1.shiftX));
        });
    });

    describe("boundary constraints", () => {
        it("should not allow movement beyond left edge", () => {
            // Position player near left edge
            player.shiftX = -0.85; // Very close to left boundary
            for (let i = 0; i < 4; i++) {
                player.points[i][0] = player.points[i][0] + player.shiftX;
            }

            const initialPosition = player.x;
            player.step(25, -1); // Try to move left

            // Should not move further left
            expect(player.x).toBe(initialPosition);
        });

        it("should not allow movement beyond right edge", () => {
            // Position player near right edge
            player.shiftX = 0.85; // Very close to right boundary
            for (let i = 0; i < 4; i++) {
                player.points[i][0] = player.points[i][0] + player.shiftX;
            }

            const initialPosition = player.x;
            player.step(25, 1); // Try to move right

            // Should not move further right
            expect(player.x).toBe(initialPosition);
        });
    });
});
