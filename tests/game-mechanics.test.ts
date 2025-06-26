import {describe, it, expect} from "bun:test";
import Player from "../src/entities/player";
import Block from "../src/entities/block";
import Rectangle from "../src/utils/rectangle";
import type Renderer from "../src/utils/renderer";

// Mock renderer for testing
const mockRenderer = {
    createBuffer: () => ({} as WebGLBuffer),
    webgl: {
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        ARRAY_BUFFER: 0,
        STATIC_DRAW: 0
    }
} as any;

describe("Game Mechanics Integration", () => {
    describe("Player-Block Collision", () => {
        it("should detect collision when block falls on player", () => {
            const player = new Player(mockRenderer as Renderer);

            // Create a block positioned directly above the player
            const block = new Block(mockRenderer as Renderer);
            // Block is now automatically initialized in constructor

            // Manually position the block to overlap with player
            const playerX = player.x;
            const playerY = player.y;

            // Set block position to overlap with player
            block.points = [
                [playerX, playerY + 0.01], // top-left
                [playerX + 0.1, playerY + 0.01], // top-right
                [playerX + 0.1, playerY - 0.01], // bottom-right
                [playerX, playerY - 0.01] // bottom-left
            ];

            expect(player.collides(block)).toBe(true);
        });

        it("should not detect collision when block misses player", () => {
            const player = new Player(mockRenderer as Renderer);
            const block = new Block(mockRenderer as Renderer);
            // Block is now automatically initialized in constructor

            // Position block far from player
            block.points = [
                [2, 1], // top-left
                [2.1, 1], // top-right
                [2.1, 0.9], // bottom-right
                [2, 0.9] // bottom-left
            ];

            expect(player.collides(block)).toBe(false);
        });

        it("should detect collision at player edges", () => {
            const player = new Player(mockRenderer as Renderer);
            const block = new Block(mockRenderer as Renderer);
            // Block is now automatically initialized in constructor

            // Position block at the edge of the player
            const playerRightEdge = player.x + player.width;

            block.points = [
                [playerRightEdge - 0.01, player.y + 0.01], // slightly overlapping
                [playerRightEdge + 0.05, player.y + 0.01],
                [playerRightEdge + 0.05, player.y - 0.01],
                [playerRightEdge - 0.01, player.y - 0.01]
            ];

            expect(player.collides(block)).toBe(true);
        });
    });

    describe("Game Physics", () => {
        it("should have consistent movement scaling", () => {
            const player = new Player(mockRenderer as Renderer);
            const block = new Block(mockRenderer as Renderer);
            // Block is now automatically initialized in constructor

            const playerInitialX = player.x;
            const blockInitialY = block.y;

            // Move both objects with same timestep
            const timestep = 25;
            player.step(timestep, 1);
            block.step(timestep);

            const playerMovement = Math.abs(player.x - playerInitialX);
            const blockMovement = Math.abs(block.y - blockInitialY);

            // Both should have moved
            expect(playerMovement).toBeGreaterThan(0);
            expect(blockMovement).toBeGreaterThan(0);

            // Movement should be related to their respective speed settings and timestep
            // We'll just check that they moved a reasonable amount
            expect(playerMovement).toBeGreaterThan(0.01);
            expect(blockMovement).toBeGreaterThan(0.01);
            expect(playerMovement).toBeLessThan(0.1);
            expect(blockMovement).toBeLessThan(0.1);
        });

        it("should handle boundary collisions properly", () => {
            const player = new Player(mockRenderer as Renderer);

            // Move player to left boundary
            for (let i = 0; i < 100; i++) {
                player.step(25, -1);
            }

            const leftBoundPosition = player.x;

            // Try to move further left
            player.step(25, -1);

            // Should not move beyond boundary
            expect(player.x).toBe(leftBoundPosition);
        });
    });

    describe("Rectangle Collision Edge Cases", () => {
        it("should handle zero-width rectangles", () => {
            const rect1 = new Rectangle([
                [0, 1],
                [0, 1], // Same x as top-left (zero width)
                [0, 0],
                [0, 0]
            ]);

            const rect2 = new Rectangle([
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0]
            ]);

            expect(rect1.width).toBe(0);
            // Zero-width rectangles typically don't register as colliding
            // because they have no area to overlap with
            expect(rect1.collides(rect2)).toBe(false);
        });

        it("should handle zero-height rectangles", () => {
            const rect1 = new Rectangle([
                [0, 0],
                [1, 0],
                [1, 0], // Same y as top-right (zero height)
                [0, 0]
            ]);

            const rect2 = new Rectangle([
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0]
            ]);

            expect(rect1.height).toBe(0);
            // Zero-height rectangles typically don't register as colliding
            // because they have no area to overlap with
            expect(rect1.collides(rect2)).toBe(false);
        });

        it("should handle negative dimensions gracefully", () => {
            // Create a rectangle with "inverted" coordinates
            const rect = new Rectangle([
                [1, 0], // "top-left" is actually bottom-right
                [0, 0], // "top-right" is actually bottom-left
                [0, 1], // "bottom-right" is actually top-left
                [1, 1] // "bottom-left" is actually top-right
            ]);

            // The calculation should still work even with negative width/height
            expect(rect.width).toBe(-1);
            expect(rect.height).toBe(-1);
        });
    });

    describe("Performance Considerations", () => {
        it("should handle many collision checks efficiently", () => {
            const player = new Player(mockRenderer as Renderer);
            const blocks: Block[] = [];

            // Create many blocks
            for (let i = 0; i < 100; i++) {
                const block = new Block(mockRenderer as Renderer);
                // Block is now automatically initialized in constructor
                blocks.push(block);
            }

            const startTime = performance.now();

            // Perform collision detection with all blocks
            let collisionCount = 0;
            for (const block of blocks) {
                if (player.collides(block)) {
                    collisionCount++;
                }
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should complete quickly (under 10ms for 100 checks)
            expect(duration).toBeLessThan(10);
            expect(collisionCount).toBeGreaterThanOrEqual(0);
        });
    });
});
