import {describe, it, expect} from "bun:test";
import {SCORE_THRESHOLD, MAX_SECONDS, PLAYER_COLOR, BG_COLOR, BLOCKS} from "../src/config";

describe("Game Configuration", () => {
    describe("SCORE_THRESHOLD", () => {
        it("should be a positive number", () => {
            expect(typeof SCORE_THRESHOLD).toBe("number");
            expect(SCORE_THRESHOLD).toBeGreaterThan(0);
        });

        it("should have different values for dev and prod", () => {
            // The value should be either 1 (dev) or 500 (prod)
            expect([1, 500]).toContain(SCORE_THRESHOLD);
        });
    });

    describe("MAX_SECONDS", () => {
        it("should be a positive number", () => {
            expect(typeof MAX_SECONDS).toBe("number");
            expect(MAX_SECONDS).toBeGreaterThan(0);
        });

        it("should have different values for dev and prod", () => {
            // The value should be either 10 (dev) or 60 (prod)
            expect([10, 60]).toContain(MAX_SECONDS);
        });
    });

    describe("PLAYER_COLOR", () => {
        it("should be a valid RGB color array", () => {
            expect(Array.isArray(PLAYER_COLOR)).toBe(true);
            expect(PLAYER_COLOR).toHaveLength(3);
        });

        it("should have values between 0 and 1", () => {
            PLAYER_COLOR.forEach(component => {
                expect(component).toBeGreaterThanOrEqual(0);
                expect(component).toBeLessThanOrEqual(1);
            });
        });

        it("should be green color", () => {
            expect(PLAYER_COLOR).toEqual([0, 1, 0]);
        });
    });

    describe("BG_COLOR", () => {
        it("should be a valid RGB color array", () => {
            expect(Array.isArray(BG_COLOR)).toBe(true);
            expect(BG_COLOR).toHaveLength(3);
        });

        it("should have values between 0 and 1", () => {
            BG_COLOR.forEach(component => {
                expect(component).toBeGreaterThanOrEqual(0);
                expect(component).toBeLessThanOrEqual(1);
            });
        });

        it("should be black color", () => {
            expect(BG_COLOR).toEqual([0, 0, 0]);
        });
    });

    describe("BLOCKS", () => {
        it("should be an array with at least one block type", () => {
            expect(Array.isArray(BLOCKS)).toBe(true);
            expect(BLOCKS.length).toBeGreaterThan(0);
        });

        it("should have exactly 3 block types", () => {
            expect(BLOCKS).toHaveLength(3);
        });

        describe("block properties", () => {
            BLOCKS.forEach((block, index) => {
                describe(`Block type ${index + 1}`, () => {
                    it("should have valid color array", () => {
                        expect(Array.isArray(block.color)).toBe(true);
                        expect(block.color).toHaveLength(3);
                        block.color.forEach(component => {
                            expect(component).toBeGreaterThanOrEqual(0);
                            expect(component).toBeLessThanOrEqual(1);
                        });
                    });

                    it("should have positive speed", () => {
                        expect(typeof block.speed).toBe("number");
                        expect(block.speed).toBeGreaterThan(0);
                    });

                    it("should have positive size", () => {
                        expect(typeof block.size).toBe("number");
                        expect(block.size).toBeGreaterThan(0);
                    });

                    it("should have positive points", () => {
                        expect(typeof block.points).toBe("number");
                        expect(block.points).toBeGreaterThan(0);
                    });
                });
            });
        });

        describe("specific block types", () => {
            it("should have red block (slow, large, 1 point)", () => {
                const redBlock = BLOCKS.find(b =>
                    b.color[0] === 1 && b.color[1] === 0 && b.color[2] === 0
                );
                expect(redBlock).toBeTruthy();
                if (redBlock) {
                    expect(redBlock.speed).toBe(1);
                    expect(redBlock.size).toBe(2.5);
                    expect(redBlock.points).toBe(1);
                }
            });

            it("should have blue block (medium speed, medium size, 5 points)", () => {
                const blueBlock = BLOCKS.find(b =>
                    b.color[0] === 0 && b.color[1] === 0 && b.color[2] === 1
                );
                expect(blueBlock).toBeTruthy();
                if (blueBlock) {
                    expect(blueBlock.speed).toBe(2);
                    expect(blueBlock.size).toBe(1.5);
                    expect(blueBlock.points).toBe(5);
                }
            });

            it("should have white block (fast, small, 25 points)", () => {
                const whiteBlock = BLOCKS.find(b =>
                    b.color[0] === 1 && b.color[1] === 1 && b.color[2] === 1
                );
                expect(whiteBlock).toBeTruthy();
                if (whiteBlock) {
                    expect(whiteBlock.speed).toBe(3);
                    expect(whiteBlock.size).toBe(1);
                    expect(whiteBlock.points).toBe(25);
                }
            });
        });

        describe("block balance", () => {
            it("should have inverse relationship between size and points", () => {
                // Larger blocks should generally have fewer points
                const sortedBySize = [...BLOCKS].sort((a, b) => b.size - a.size);

                expect(sortedBySize[0].points).toBeLessThanOrEqual(sortedBySize[2].points);
            });

            it("should have relationship between speed and difficulty", () => {
                // Faster blocks should generally have more points (harder to catch)
                const fastestBlock = BLOCKS.reduce((prev, current) =>
                    current.speed > prev.speed ? current : prev
                );
                const slowestBlock = BLOCKS.reduce((prev, current) =>
                    current.speed < prev.speed ? current : prev
                );

                expect(fastestBlock.points).toBeGreaterThan(slowestBlock.points);
            });
        });
    });
});
