import {describe, it, expect, beforeEach} from "bun:test";
import Rectangle from "../src/utils/rectangle";

describe("Rectangle", () => {
    let rectangle: Rectangle;

    beforeEach(() => {
        // Create a simple 1x1 rectangle at origin
        rectangle = new Rectangle([
            [0, 1], // top-left
            [1, 1], // top-right
            [1, 0], // bottom-right
            [0, 0] // bottom-left
        ]);
    });

    describe("constructor", () => {
        it("should create a rectangle with 4 points", () => {
            expect(rectangle.points).toHaveLength(4);
        });

        it("should throw error with wrong number of points", () => {
            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return new Rectangle([[0, 0], [1, 1]] as any);
            }).toThrow("Wrong number of vertices for a rectangle. Expected 4, but got 2");
        });
    });

    describe("getters", () => {
        it("should return correct corner points", () => {
            expect(rectangle.topLeft).toEqual([0, 1]);
            expect(rectangle.topRight).toEqual([1, 1]);
            expect(rectangle.bottomRight).toEqual([1, 0]);
            expect(rectangle.bottomLeft).toEqual([0, 0]);
        });

        it("should return correct position", () => {
            expect(rectangle.x).toBe(0);
            expect(rectangle.y).toBe(1);
        });

        it("should calculate correct dimensions", () => {
            expect(rectangle.width).toBe(1);
            expect(rectangle.height).toBe(1);
        });
    });

    describe("collision detection", () => {
        it("should detect collision with overlapping rectangle", () => {
            const other = new Rectangle([
                [0.5, 1.5], // top-left
                [1.5, 1.5], // top-right
                [1.5, 0.5], // bottom-right
                [0.5, 0.5] // bottom-left
            ]);

            expect(rectangle.collides(other)).toBe(true);
        });

        it("should not detect collision with non-overlapping rectangle", () => {
            const other = new Rectangle([
                [2, 3], // top-left
                [3, 3], // top-right
                [3, 2], // bottom-right
                [2, 2] // bottom-left
            ]);

            expect(rectangle.collides(other)).toBe(false);
        });

        it("should detect collision with touching rectangles", () => {
            const other = new Rectangle([
                [0.9, 1], // top-left (slightly overlapping right edge)
                [2, 1], // top-right
                [2, 0], // bottom-right
                [0.9, 0] // bottom-left
            ]);

            expect(rectangle.collides(other)).toBe(true);
        });

        it("should detect collision with rectangle directly above", () => {
            const other = new Rectangle([
                [0, 1.1], // top-left
                [1, 1.1], // top-right
                [1, 0.9], // bottom-right (slightly overlapping)
                [0, 0.9] // bottom-left
            ]);

            expect(rectangle.collides(other)).toBe(true);
        });
    });
});
