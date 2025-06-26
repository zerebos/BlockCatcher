/**
 * Generic Object Pool implementation
 * Manages a pool of reusable objects to avoid frequent allocation/deallocation
 */

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

export default class ObjectPool<T extends Poolable> {
    private available: T[] = [];
    private inUse: Set<T> = new Set();
    private createFn: () => T;
    private readonly maxSize: number;

    /**
     * Create a new object pool
     * @param createFn Function that creates new objects
     * @param initialSize Number of objects to pre-create
     * @param maxSize Maximum pool size (optional, defaults to initialSize * 2)
     */
    constructor(createFn: () => T, initialSize: number, maxSize?: number) {
        this.createFn = createFn;
        this.maxSize = maxSize ?? initialSize * 2;

        // Pre-create initial objects
        for (let i = 0; i < initialSize; i++) {
            const obj = this.createFn();
            obj.reset();
            this.available.push(obj);
        }
    }

    /**
     * Get an object from the pool
     * @returns Object from pool or null if pool is exhausted
     */
    acquire(): T | null {
        let obj: T;

        if (this.available.length > 0) {
            // Use existing object from pool
            obj = this.available.pop()!;
        }
        else if (this.inUse.size < this.maxSize) {
            // Create new object if under max size
            obj = this.createFn();
        }
        else {
            // Pool exhausted
            return null;
        }

        this.inUse.add(obj);
        obj.reset(); // Always reset when acquiring from pool
        return obj;
    }

    /**
     * Return an object to the pool
     * @param obj Object to return to pool
     */
    release(obj: T): void {
        if (this.inUse.has(obj)) {
            this.inUse.delete(obj);
            // Call prepareForPool if available to prepare object for storage
            if (obj.prepareForPool) {
                obj.prepareForPool();
            }
            // No fallback to reset() - objects should implement prepareForPool for proper pooling
            this.available.push(obj);
        }
    }

    /**
     * Release all inactive objects back to the pool
     * Useful for cleaning up objects that may have been forgotten
     */
    releaseInactive(): number {
        let releasedCount = 0;

        for (const obj of this.inUse) {
            if (!obj.isActive()) {
                this.release(obj);
                releasedCount++;
            }
        }

        return releasedCount;
    }

    /**
     * Get pool statistics
     */
    getStats() {
        return {
            available: this.available.length,
            inUse: this.inUse.size,
            total: this.available.length + this.inUse.size,
            maxSize: this.maxSize
        };
    }

    /**
     * Clear the entire pool (for cleanup)
     */
    clear(): void {
        this.available.length = 0;
        this.inUse.clear();
    }
}
