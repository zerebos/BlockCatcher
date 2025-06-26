import {describe, it, expect, beforeEach} from "bun:test";
import ObjectPool from "../src/utils/object-pool";
import type {Poolable} from "../src/types";

// Mock Poolable object for testing
class MockPoolableObject implements Poolable {
    private active = false;
    private value = 0;

    reset(): void {
        this.active = true;
        this.value = Math.random();
    }

    isActive(): boolean {
        return this.active;
    }

    prepareForPool(): void {
        this.active = false;
    }

    getValue(): number {
        return this.value;
    }
}

describe("Object Pool", () => {
    let pool: ObjectPool<MockPoolableObject>;

    beforeEach(() => {
        pool = new ObjectPool(() => new MockPoolableObject(), 5, 10);
    });

    describe("Initialization", () => {
        it("should pre-create initial objects", () => {
            const stats = pool.getStats();
            expect(stats.available).toBe(5);
            expect(stats.inUse).toBe(0);
            expect(stats.total).toBe(5);
            expect(stats.maxSize).toBe(10);
        });
    });

    describe("Acquire and Release", () => {
        it("should acquire objects from the pool", () => {
            const obj1 = pool.acquire();
            const obj2 = pool.acquire();

            expect(obj1).not.toBeNull();
            expect(obj2).not.toBeNull();
            expect(obj1).not.toBe(obj2);

            const stats = pool.getStats();
            expect(stats.available).toBe(3);
            expect(stats.inUse).toBe(2);
        });

        it("should release objects back to the pool", () => {
            const obj = pool.acquire()!;
            expect(obj).not.toBeNull();

            pool.release(obj);

            const stats = pool.getStats();
            expect(stats.available).toBe(5);
            expect(stats.inUse).toBe(0);
        });

        it("should call reset when acquiring objects", () => {
            const obj = pool.acquire()!;
            expect(obj.isActive()).toBe(true);
            expect(obj.getValue()).toBeGreaterThan(0);
        });

        it("should prepare object for pool when releasing", () => {
            const obj = pool.acquire()!;
            expect(obj.isActive()).toBe(true);

            obj.prepareForPool();
            pool.release(obj);

            expect(obj.isActive()).toBe(false); // Should remain inactive until acquired again
        });
    });

    describe("Pool Limits", () => {
        it("should create new objects when pool is empty but under max", () => {
            // Acquire all pre-created objects
            const objects = [];
            for (let i = 0; i < 5; i++) {
                objects.push(pool.acquire());
            }

            // Should create new object since we're under max (10)
            const newObj = pool.acquire();
            expect(newObj).not.toBeNull();

            const stats = pool.getStats();
            expect(stats.inUse).toBe(6);
            expect(stats.available).toBe(0);
        });

        it("should return null when pool is exhausted", () => {
            // Acquire maximum number of objects
            const objects = [];
            for (let i = 0; i < 10; i++) {
                const obj = pool.acquire();
                if (obj) objects.push(obj);
            }

            // Pool should be exhausted
            const shouldBeNull = pool.acquire();
            expect(shouldBeNull).toBeNull();

            const stats = pool.getStats();
            expect(stats.inUse).toBe(10);
            expect(stats.available).toBe(0);
        });
    });

    describe("Inactive Release", () => {
        it("should release inactive objects", () => {
            const obj1 = pool.acquire()!;
            pool.acquire()!; // obj2 - acquire but don't store reference
            const obj3 = pool.acquire()!;

            // Prepare some objects for pool return
            obj1.prepareForPool();
            obj3.prepareForPool();

            const releasedCount = pool.releaseInactive();

            expect(releasedCount).toBe(2);
            const stats = pool.getStats();
            expect(stats.inUse).toBe(1); // Only obj2 should remain
            expect(stats.available).toBe(4); // 2 original + 2 released
        });
    });

    describe("Pool Management", () => {
        it("should clear the pool", () => {
            pool.acquire();
            pool.acquire();

            pool.clear();

            const stats = pool.getStats();
            expect(stats.available).toBe(0);
            expect(stats.inUse).toBe(0);
            expect(stats.total).toBe(0);
        });

        it("should track statistics correctly", () => {
            const obj1 = pool.acquire();
            pool.acquire(); // obj2 - acquire but don't store reference

            let stats = pool.getStats();
            expect(stats.available).toBe(3);
            expect(stats.inUse).toBe(2);
            expect(stats.total).toBe(5);

            pool.release(obj1!);

            stats = pool.getStats();
            expect(stats.available).toBe(4);
            expect(stats.inUse).toBe(1);
            expect(stats.total).toBe(5);
        });
    });
});
