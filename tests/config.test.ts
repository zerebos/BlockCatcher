import {describe, it, expect} from "bun:test";
import {SCORE_THRESHOLD, MAX_SECONDS, PLAYER_COLOR, BG_COLOR, BLOCKS, MASTER_VOLUME, darkenColor} from "../src/config";

describe("Game Configuration", () => {
    describe("SCORE_THRESHOLD", () => {
        it("should be a positive number", () => {
            expect(typeof SCORE_THRESHOLD).toBe("number");
            expect(SCORE_THRESHOLD).toBeGreaterThan(0);
        });

        it("should have different values for dev and prod", () => {
            // The value should be either 25 (dev) or 500 (prod)
            expect([25, 500]).toContain(SCORE_THRESHOLD);
        });
    });

    describe("MAX_SECONDS", () => {
        it("should be a positive number", () => {
            expect(typeof MAX_SECONDS).toBe("number");
            expect(MAX_SECONDS).toBeGreaterThan(0);
        });

        it("should have different values for dev and prod", () => {
            // The value should be either 30 (dev) or 60 (prod)
            expect([30, 60]).toContain(MAX_SECONDS);
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

        it("should be white color", () => {
            expect(PLAYER_COLOR).toEqual([1, 1, 1]);
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
            it("should have pink block (slow, large, 1 point)", () => {
                const pinkBlock = BLOCKS.find(b =>
                    b.color[0] === 1 && b.color[1] === 0 && b.color[2] === 0.5
                );
                expect(pinkBlock).toBeTruthy();
                if (pinkBlock) {
                    expect(pinkBlock.speed).toBe(1);
                    expect(pinkBlock.size).toBe(2.5);
                    expect(pinkBlock.points).toBe(1);
                }
            });

            it("should have purple block (medium speed, medium size, 5 points)", () => {
                const purpleBlock = BLOCKS.find(b =>
                    b.color[0] === 0.6 && b.color[1] === 0.2 && b.color[2] === 0.8
                );
                expect(purpleBlock).toBeTruthy();
                if (purpleBlock) {
                    expect(purpleBlock.speed).toBe(2);
                    expect(purpleBlock.size).toBe(1.5);
                    expect(purpleBlock.points).toBe(5);
                }
            });

            it("should have cyan block (fast, small, 25 points)", () => {
                const cyanBlock = BLOCKS.find(b =>
                    b.color[0] === 0 && b.color[1] === 1 && b.color[2] === 1
                );
                expect(cyanBlock).toBeTruthy();
                if (cyanBlock) {
                    expect(cyanBlock.speed).toBe(3);
                    expect(cyanBlock.size).toBe(1);
                    expect(cyanBlock.points).toBe(25);
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

    describe("MASTER_VOLUME", () => {
        it("should be a valid volume level", () => {
            expect(typeof MASTER_VOLUME).toBe("number");
            expect(MASTER_VOLUME).toBeGreaterThanOrEqual(0);
            expect(MASTER_VOLUME).toBeLessThanOrEqual(1);
        });

        it("should be set to 60% volume", () => {
            expect(MASTER_VOLUME).toBe(0.6);
        });
    });

    describe("darkenColor utility", () => {
        it("should darken a color by default factor", () => {
            const color = [1, 0.8, 0.6];
            const darkened = darkenColor(color);

            expect(darkened[0]).toBeCloseTo(0.7, 5); // 1 * 0.7
            expect(darkened[1]).toBeCloseTo(0.56, 5); // 0.8 * 0.7
            expect(darkened[2]).toBeCloseTo(0.42, 5); // 0.6 * 0.7
        });

        it("should darken a color by custom factor", () => {
            const color = [1, 1, 1];
            const darkened = darkenColor(color, 0.5);

            expect(darkened).toEqual([0.5, 0.5, 0.5]);
        });

        it("should not go below zero", () => {
            const color = [0.1, 0.1, 0.1];
            const darkened = darkenColor(color, 0.1);

            darkened.forEach(component => {
                expect(component).toBeGreaterThanOrEqual(0);
            });
        });

        it("should handle synthwave colors correctly", () => {
            const cyan = [0, 1, 1];
            const pink = [1, 0, 0.5];

            const darkenedCyan = darkenColor(cyan);
            const darkenedPink = darkenColor(pink);

            expect(darkenedCyan[0]).toBe(0); // 0 * 0.7 = 0
            expect(darkenedCyan[1]).toBeCloseTo(0.7, 5); // 1 * 0.7 = 0.7
            expect(darkenedCyan[2]).toBeCloseTo(0.7, 5); // 1 * 0.7 = 0.7

            expect(darkenedPink[0]).toBeCloseTo(0.7, 5); // 1 * 0.7 = 0.7
            expect(darkenedPink[1]).toBe(0); // 0 * 0.7 = 0
            expect(darkenedPink[2]).toBeCloseTo(0.35, 5); // 0.5 * 0.7 = 0.35
        });
    });
});
