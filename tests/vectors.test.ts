import {describe, it, expect} from "bun:test";
import vec, {vec2, vec3, vec4} from "../src/utils/vectors";

describe("Vector utilities", () => {
    describe("vec (generic vector creation)", () => {
        it("should create vector of specified length", () => {
            const result = vec([1, 2], 4);
            expect(result).toEqual([1, 2, 0, 0]);
            expect(result).toHaveLength(4);
        });

        it("should truncate if input is longer than target length", () => {
            const result = vec([1, 2, 3, 4, 5], 3);
            expect(result).toEqual([1, 2, 3]);
            expect(result).toHaveLength(3);
        });

        it("should pad with zeros if input is shorter", () => {
            const result = vec([1], 3);
            expect(result).toEqual([1, 0, 0]);
        });

        it("should return empty array when length is 0", () => {
            const result = vec([1, 2, 3], 0);
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it("should handle empty input array", () => {
            const result = vec([], 3);
            expect(result).toEqual([0, 0, 0]);
        });
    });

    describe("vec2", () => {
        it("should create 2D vector with provided elements", () => {
            const result = vec2(1, 2);
            expect(result).toEqual([1, 2]);
            expect(result).toHaveLength(2);
        });

        it("should pad with zeros if fewer than 2 elements", () => {
            const result = vec2(1);
            expect(result).toEqual([1, 0]);
        });

        it("should truncate if more than 2 elements", () => {
            const result = vec2(1, 2, 3, 4);
            expect(result).toEqual([1, 2]);
        });

        it("should create zero vector with no arguments", () => {
            const result = vec2();
            expect(result).toEqual([0, 0]);
        });

        it("should handle negative values", () => {
            const result = vec2(-1.5, -2.7);
            expect(result).toEqual([-1.5, -2.7]);
        });

        it("should handle decimal values", () => {
            const result = vec2(0.5, 0.25);
            expect(result).toEqual([0.5, 0.25]);
        });
    });

    describe("vec3", () => {
        it("should create 3D vector with provided elements", () => {
            const result = vec3(1, 2, 3);
            expect(result).toEqual([1, 2, 3]);
            expect(result).toHaveLength(3);
        });

        it("should pad with zeros if fewer than 3 elements", () => {
            const result = vec3(1, 2);
            expect(result).toEqual([1, 2, 0]);
        });

        it("should truncate if more than 3 elements", () => {
            const result = vec3(1, 2, 3, 4, 5);
            expect(result).toEqual([1, 2, 3]);
        });

        it("should create zero vector with no arguments", () => {
            const result = vec3();
            expect(result).toEqual([0, 0, 0]);
        });
    });

    describe("vec4", () => {
        it("should create 4D vector with provided elements", () => {
            const result = vec4(1, 2, 3, 4);
            expect(result).toEqual([1, 2, 3, 4]);
            expect(result).toHaveLength(4);
        });

        it("should pad with zeros if fewer than 4 elements", () => {
            const result = vec4(1, 2, 3);
            expect(result).toEqual([1, 2, 3, 0]);
        });

        it("should truncate if more than 4 elements", () => {
            const result = vec4(1, 2, 3, 4, 5, 6);
            expect(result).toEqual([1, 2, 3, 4]);
        });

        it("should create zero vector with no arguments", () => {
            const result = vec4();
            expect(result).toEqual([0, 0, 0, 0]);
        });
    });

    describe("type safety", () => {
        it("should maintain correct types for vec2", () => {
            const result = vec2(1, 2);
            // TypeScript should ensure this is Vec2 type
            expect(result[0]).toBe(1);
            expect(result[1]).toBe(2);
        });

        it("should maintain correct types for vec3", () => {
            const result = vec3(1, 2, 3);
            // TypeScript should ensure this is Vec3 type
            expect(result[0]).toBe(1);
            expect(result[1]).toBe(2);
            expect(result[2]).toBe(3);
        });

        it("should maintain correct types for vec4", () => {
            const result = vec4(1, 2, 3, 4);
            // TypeScript should ensure this is Vec4 type
            expect(result[0]).toBe(1);
            expect(result[1]).toBe(2);
            expect(result[2]).toBe(3);
            expect(result[3]).toBe(4);
        });
    });
});
