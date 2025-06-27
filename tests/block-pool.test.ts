import {describe, it, expect, beforeEach} from "bun:test";
import ObjectPool from "../src/managers/pool";
import Block from "../src/entities/block";

// Mock renderer for testing
const mockRenderer = {
    webgl: {
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        ARRAY_BUFFER: 0,
        STATIC_DRAW: 0
    },
    createBuffer: () => ({})
} as unknown as import("../src/managers/render").default;

describe("Block Pool Integration", () => {
    let blockPool: ObjectPool<Block>;

    beforeEach(() => {
        blockPool = new ObjectPool(() => new Block(mockRenderer), 5, 10);
    });

    describe("Initialization", () => {
        it("should create block pool with correct initial size", () => {
            const stats = blockPool.getStats();
            expect(stats.available).toBe(5);
            expect(stats.inUse).toBe(0);
            expect(stats.maxSize).toBe(10);
        });
    });

    describe("Block Management", () => {
        it("should acquire blocks from the pool", () => {
            const block1 = blockPool.acquire();
            const block2 = blockPool.acquire();

            expect(block1).toBeTruthy();
            expect(block2).toBeTruthy();
            expect(block1?.isActive()).toBe(true);
            expect(block2?.isActive()).toBe(true);

            const stats = blockPool.getStats();
            expect(stats.available).toBe(3);
            expect(stats.inUse).toBe(2);
        });

        it("should release blocks back to the pool", () => {
            const block = blockPool.acquire()!;
            expect(block).toBeTruthy();

            blockPool.release(block);

            expect(block.isActive()).toBe(false);

            const stats = blockPool.getStats();
            expect(stats.available).toBe(5);
            expect(stats.inUse).toBe(0);
        });

        it("should handle pool exhaustion gracefully", () => {
            // Exhaust the pool
            const blocks = [];
            for (let i = 0; i < 10; i++) {
                const block = blockPool.acquire();
                if (block) blocks.push(block);
            }

            // Try to get one more - should return null
            const shouldBeNull = blockPool.acquire();
            expect(shouldBeNull).toBeNull();
        });

        it("should release inactive blocks", () => {
            const block1 = blockPool.acquire()!;
            blockPool.acquire()!; // block2 - acquire but don't store reference
            const block3 = blockPool.acquire()!;

            // Manually prepare some blocks for pool (simulating blocks that fell off screen)
            block1.prepareForPool();
            block3.prepareForPool();

            const releasedCount = blockPool.releaseInactive();
            expect(releasedCount).toBe(2);

            const stats = blockPool.getStats();
            expect(stats.available).toBe(4); // 2 original + 2 released
            expect(stats.inUse).toBe(1); // 1 still active
        });
    });

    describe("Pool Statistics", () => {
        it("should provide accurate statistics", () => {
            const initialStats = blockPool.getStats();
            expect(initialStats.total).toBe(5);

            blockPool.acquire();
            blockPool.acquire();

            const stats = blockPool.getStats();
            expect(stats.available).toBe(3);
            expect(stats.inUse).toBe(2);
            expect(stats.total).toBe(5);
        });
    });

    describe("Cleanup", () => {
        it("should clear the pool", () => {
            blockPool.acquire();
            blockPool.acquire();

            blockPool.clear();

            const stats = blockPool.getStats();
            expect(stats.available).toBe(0);
            expect(stats.inUse).toBe(0);
            expect(stats.total).toBe(0);
        });
    });
});
