// Type declarations for Bun's built-in test framework
declare module "bun:test" {
    export function describe(name: string, fn: () => void): void;
    export function it(name: string, fn: () => void | Promise<void>): void;
    export function test(name: string, fn: () => void | Promise<void>): void;
    export function expect<T>(actual: T): {
        toBe(expected: T): void;
        toEqual(expected: T): void;
        toBeNull(): void;
        toBeUndefined(): void;
        toBeTruthy(): void;
        toBeFalsy(): void;
        toThrow(expected?: string | RegExp): void;
        toHaveLength(expected: number): void;
        toBeGreaterThan(expected: number): void;
        toBeGreaterThanOrEqual(expected: number): void;
        toBeLessThan(expected: number): void;
        toBeLessThanOrEqual(expected: number): void;
        toBeCloseTo(expected: number, precision?: number): void;
        toContain(expected: unknown): void;
        toMatch(expected: string | RegExp): void;
        not: {
            toBe(expected: T): void;
            toEqual(expected: T): void;
            toBeNull(): void;
            toBeUndefined(): void;
            toBeTruthy(): void;
            toBeFalsy(): void;
            toThrow(expected?: string | RegExp): void;
            toHaveLength(expected: number): void;
            toBeGreaterThan(expected: number): void;
            toBeGreaterThanOrEqual(expected: number): void;
            toBeLessThan(expected: number): void;
            toBeLessThanOrEqual(expected: number): void;
            toBeCloseTo(expected: number, precision?: number): void;
            toContain(expected: unknown): void;
            toMatch(expected: string | RegExp): void;
        };
    };
    export function beforeEach(fn: () => void | Promise<void>): void;
    export function afterEach(fn: () => void | Promise<void>): void;
    export function beforeAll(fn: () => void | Promise<void>): void;
    export function afterAll(fn: () => void | Promise<void>): void;
}
