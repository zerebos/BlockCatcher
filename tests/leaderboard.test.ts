import {describe, it, expect, beforeEach, afterEach} from "bun:test";
import LocalLeaderboardProvider from "../src/leaderboard/providers/local";
import LeaderboardManager from "../src/leaderboard/manager";
import type {LeaderboardEntry} from "../src/leaderboard/types";

// ─── localStorage mock ───────────────────────────────────────────────────────

const store = new Map<string, string>();
const localStorageMock = {
    getItem:    (key: string)              => store.get(key) ?? null,
    setItem:    (key: string, val: string) => {store.set(key, val);},
    removeItem: (key: string)              => {store.delete(key);},
    clear:      ()                         => store.clear(),
};

// ─── crypto.randomUUID mock ──────────────────────────────────────────────────

let uuidCounter = 0;
const cryptoMock = {
    randomUUID: () => `test-uuid-${++uuidCounter}`,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
    return {
        id:            cryptoMock.randomUUID(),
        name:          "Tester",
        score:         100,
        timeRemaining: 30,
        timestamp:     Date.now(),
        source:        "local",
        ...overrides,
    };
}

// ─── Setup / teardown ────────────────────────────────────────────────────────

beforeEach(() => {
    store.clear();
    uuidCounter = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).localStorage = localStorageMock;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).crypto       = cryptoMock;
});

afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).localStorage;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).crypto;
});

// ─── LocalLeaderboardProvider ────────────────────────────────────────────────

describe("LocalLeaderboardProvider", () => {
    let provider: LocalLeaderboardProvider;

    beforeEach(() => {
        provider = new LocalLeaderboardProvider();
    });

    it("returns empty array when no entries stored", async () => {
        const entries = await provider.getEntries();
        expect(entries).toEqual([]);
    });

    it("stores and retrieves a single entry", async () => {
        const entry = makeEntry({score: 200});
        await provider.addEntry(entry);
        const entries = await provider.getEntries();
        expect(entries).toHaveLength(1);
        expect(entries[0].score).toBe(200);
        expect(entries[0].name).toBe("Tester");
    });

    it("sorts entries by score descending", async () => {
        await provider.addEntry(makeEntry({score: 50}));
        await provider.addEntry(makeEntry({score: 300}));
        await provider.addEntry(makeEntry({score: 150}));

        const entries = await provider.getEntries();
        expect(entries[0].score).toBe(300);
        expect(entries[1].score).toBe(150);
        expect(entries[2].score).toBe(50);
    });

    it("ties are broken by most recent timestamp", async () => {
        const older = makeEntry({score: 100, timestamp: 1000});
        const newer = makeEntry({score: 100, timestamp: 2000});
        await provider.addEntry(older);
        await provider.addEntry(newer);

        const entries = await provider.getEntries();
        expect(entries[0].timestamp).toBe(2000);
    });

    it("trims to 10 entries keeping the best scores", async () => {
        for (let i = 1; i <= 12; i++) {
            await provider.addEntry(makeEntry({score: i * 10}));
        }
        const entries = await provider.getEntries();
        expect(entries).toHaveLength(10);
        // Lowest should be 30 (rank 10 out of scores 120,110,...,30)
        expect(entries[9].score).toBe(30);
    });

    describe("isHighScore", () => {
        it("returns true when the board is not yet full", async () => {
            await provider.addEntry(makeEntry({score: 500}));
            expect(await provider.isHighScore(1)).toBe(true);
        });

        it("returns true when the score beats the lowest entry on a full board", async () => {
            for (let i = 1; i <= 10; i++) {
                await provider.addEntry(makeEntry({score: i * 100}));
            }
            // Lowest is 100; 101 should qualify
            expect(await provider.isHighScore(101)).toBe(true);
        });

        it("returns false when the score does not beat the lowest entry on a full board", async () => {
            for (let i = 1; i <= 10; i++) {
                await provider.addEntry(makeEntry({score: i * 100}));
            }
            // Lowest is 100; 100 itself is not strictly greater
            expect(await provider.isHighScore(100)).toBe(false);
        });

        it("returns false when the score is below the lowest entry on a full board", async () => {
            for (let i = 1; i <= 10; i++) {
                await provider.addEntry(makeEntry({score: i * 100}));
            }
            expect(await provider.isHighScore(50)).toBe(false);
        });
    });

    it("returns empty array when stored JSON is corrupted", async () => {
        store.set("blockcatcher_leaderboard", "not-valid-json{{");
        const entries = await provider.getEntries();
        expect(entries).toEqual([]);
    });
});

// ─── LeaderboardManager ──────────────────────────────────────────────────────

describe("LeaderboardManager", () => {
    let manager: LeaderboardManager;
    let provider: LocalLeaderboardProvider;

    beforeEach(() => {
        provider = new LocalLeaderboardProvider();
        manager  = new LeaderboardManager([provider]);
    });

    describe("getEntries / addEntry", () => {
        it("returns empty array initially", async () => {
            expect(await manager.getEntries()).toEqual([]);
        });

        it("adds an entry and retrieves it", async () => {
            const entry = makeEntry({score: 400});
            await manager.addEntry(entry);
            const entries = await manager.getEntries();
            expect(entries).toHaveLength(1);
            expect(entries[0].score).toBe(400);
        });

        it("deduplicates entries with the same id across providers", async () => {
            // Two providers pointing at the same underlying store
            const provider2 = new LocalLeaderboardProvider();
            const dualManager = new LeaderboardManager([provider, provider2]);

            const entry = makeEntry({score: 99});
            await dualManager.addEntry(entry);

            // Both providers return the same entry; manager should deduplicate
            const entries = await dualManager.getEntries();
            expect(entries.filter(e => e.id === entry.id)).toHaveLength(1);
        });

        it("merges and sorts entries from multiple providers", async () => {
            // Provider B is a second isolated provider with its own store key.
            // We simulate it by using an in-memory stub.
            const memEntries: LeaderboardEntry[] = [
                makeEntry({score: 999, id: "global-1", source: "global"}),
            ];
            const globalProviderStub = {
                getEntries:  async () => [...memEntries],
                addEntry:    async (e: LeaderboardEntry) => {memEntries.push(e);},
                isHighScore: async () => true,
            };

            const multiManager = new LeaderboardManager([provider, globalProviderStub]);
            await provider.addEntry(makeEntry({score: 42, id: "local-1"}));

            const entries = await multiManager.getEntries();
            // global score 999 should come first
            expect(entries[0].score).toBe(999);
            expect(entries[1].score).toBe(42);
        });
    });

    describe("isHighScore", () => {
        it("returns true when any provider says so", async () => {
            // Board is empty → always a high score
            expect(await manager.isHighScore(1)).toBe(true);
        });
    });

    describe("player name persistence", () => {
        it("returns empty string when no name saved", () => {
            expect(manager.getLastPlayerName()).toBe("");
        });

        it("saves and retrieves the player name", () => {
            manager.savePlayerName("Speedrunner");
            expect(manager.getLastPlayerName()).toBe("Speedrunner");
        });
    });

    describe("createEntry", () => {
        it("creates a valid entry with the given parameters", () => {
            const entry = manager.createEntry("Alice", 350, 15.5);
            expect(entry.name).toBe("Alice");
            expect(entry.score).toBe(350);
            expect(entry.timeRemaining).toBe(15.5);
            expect(entry.source).toBe("local");
            expect(typeof entry.id).toBe("string");
            expect(entry.id.length).toBeGreaterThan(0);
            expect(typeof entry.timestamp).toBe("number");
        });

        it("falls back to 'Player' when name is blank", () => {
            const entry = manager.createEntry("   ", 100, 0);
            expect(entry.name).toBe("Player");
        });

        it("clamps negative timeRemaining to 0", () => {
            const entry = manager.createEntry("Bob", 50, -10);
            expect(entry.timeRemaining).toBe(0);
        });

        it("generates unique ids for different entries", () => {
            const a = manager.createEntry("A", 1, 1);
            const b = manager.createEntry("B", 2, 2);
            expect(a.id).not.toBe(b.id);
        });
    });
});
