import {describe, it, expect, beforeEach} from "bun:test";
import Block from "../src/block";
import {BLOCKS} from "../src/config";
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

describe("Block", () => {
    let block: Block;

    beforeEach(() => {
        // Mock Math.random to ensure predictable testing
        const originalRandom = Math.random;
        Math.random = () => 0.5; // Always return 0.5 for consistent positioning

        block = new Block(mockRenderer as Renderer);
        // Block is now automatically initialized in constructor

        // Restore original Math.random
        Math.random = originalRandom;
    });

    describe("constructor", () => {
        it("should create a block with valid block data", () => {
            expect(BLOCKS).toContain(block.blockData);
        });

        it("should initialize with zero vertical shift", () => {
            expect(block.shiftY).toBe(0);
        });

        it("should set deltaTrans based on block speed", () => {
            expect(block.deltaTrans).toBe(0.010 * block.blockData.speed);
        });

        it("should start above the visible area", () => {
            expect(block.y).toBeGreaterThan(1.0);
        });

        it("should create block with correct dimensions", () => {
            const expectedSize = 0.1 * block.blockData.size;
            expect(block.width).toBeCloseTo(expectedSize, 10);
            expect(block.height).toBeCloseTo(expectedSize, 10);
        });
    });

    describe("uniforms", () => {
        it("should return correct uniform values", () => {
            const uniforms = block.uniforms;
            expect(uniforms.xshift).toBe(0);
            expect(uniforms.yshift).toBe(0);
            expect(uniforms.color).toEqual(block.blockData.color);
        });

        it("should update yshift uniform when block falls", () => {
            block.step(25);
            const uniforms = block.uniforms;
            expect(uniforms.yshift).toBeLessThan(0); // Block should fall down
        });
    });

    describe("movement", () => {
        it("should fall downward by default", () => {
            const initialY = block.y;
            block.step(25); // Standard timestep

            expect(block.y).toBeLessThan(initialY);
            expect(block.shiftY).toBeLessThan(0);
        });

        it("should move upward when upward parameter is true", () => {
            const initialY = block.y;
            block.step(25, true);

            expect(block.y).toBeGreaterThan(initialY);
            expect(block.shiftY).toBeGreaterThan(0);
        });

        it("should scale movement with timestep", () => {
            // Create fresh blocks to avoid state interference
            const originalRandom = Math.random;
            Math.random = () => 0.5; // Ensure consistent block creation

            const block1 = new Block(mockRenderer as Renderer);
            const block2 = new Block(mockRenderer as Renderer);

            // Initialize both blocks for testing
            block1.reset();
            block2.reset();

            Math.random = originalRandom;

            block1.step(25); // Normal timestep
            block2.step(50); // Double timestep

            // The second block should move more (approximately double)
            expect(Math.abs(block2.shiftY)).toBeGreaterThan(Math.abs(block1.shiftY));
        });

        it("should move faster for higher speed blocks", () => {
            // Create multiple blocks and find ones with different speeds
            const blocks: Block[] = [];
            for (let i = 0; i < 20; i++) {
                const testBlock = new Block(mockRenderer as Renderer);
                // Block is now automatically initialized in constructor
                blocks.push(testBlock);
            }

            // Find blocks with different speeds
            const slowBlock = blocks.find(b => b.blockData.speed === 1);
            const fastBlock = blocks.find(b => b.blockData.speed === 3);

            if (slowBlock && fastBlock) {
                slowBlock.step(25);
                fastBlock.step(25);

                expect(Math.abs(fastBlock.shiftY)).toBeGreaterThan(Math.abs(slowBlock.shiftY));
            }
        });
    });

    describe("block types", () => {
        it("should generate all block types eventually", () => {
            const foundTypes = new Set<number>();

            // Generate many blocks to ensure we get all types
            for (let i = 0; i < 100; i++) {
                const testBlock = new Block(mockRenderer as Renderer);
                // Block is now automatically initialized in constructor
                foundTypes.add(testBlock.blockData.speed);
            }

            // Should have found blocks with different speeds (indicating different types)
            expect(foundTypes.size).toBeGreaterThan(1);
        });

        it("should have valid point values", () => {
            const validPoints = [1, 5, 25]; // Known valid point values
            expect(validPoints).toContain(block.blockData.points);
        });

        it("should have valid colors", () => {
            expect(block.blockData.color).toHaveLength(3);
            expect(block.blockData.color.every(c => c >= 0 && c <= 1)).toBe(true);
        });

        it("should have positive speed and size", () => {
            expect(block.blockData.speed).toBeGreaterThan(0);
            expect(block.blockData.size).toBeGreaterThan(0);
        });
    });

    describe("position validation", () => {
        it("should generate blocks within horizontal bounds", () => {
            // Test many random generations to ensure bounds are respected
            for (let i = 0; i < 50; i++) {
                const testBlock = new Block(mockRenderer as Renderer);
                expect(testBlock.x).toBeGreaterThanOrEqual(-1);
                expect(testBlock.x + testBlock.width).toBeLessThanOrEqual(1);
            }
        });
    });
});
