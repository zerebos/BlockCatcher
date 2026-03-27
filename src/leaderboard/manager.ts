import type {LeaderboardEntry, LeaderboardProvider} from "./types";

const NAME_STORAGE_KEY = "blockcatcher_player_name";

/**
 * Coordinates one or more LeaderboardProviders.
 *
 * Writes fan out to every provider so each backend stays in sync.
 * Reads merge and deduplicate results from all providers (keyed on entry.id)
 * so a local + global setup shows a unified, ranked list.
 *
 * Adding a new backend (e.g. Supabase) requires only passing an additional
 * provider to the constructor — no other code changes needed.
 */
export default class LeaderboardManager {
    private providers: LeaderboardProvider[];

    constructor(providers: LeaderboardProvider[]) {
        this.providers = providers;
    }

    /**
     * Retrieve all entries from every provider, deduplicated and sorted by
     * score descending (ties broken by most recent timestamp).
     */
    async getEntries(): Promise<LeaderboardEntry[]> {
        const perProvider = await Promise.all(this.providers.map(p => p.getEntries()));
        const merged = perProvider.flat();
        const seen = new Set<string>();
        const deduped = merged.filter(entry => {
            if (seen.has(entry.id)) return false;
            seen.add(entry.id);
            return true;
        });
        return deduped.sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);
    }

    /** Persist an entry to every provider. */
    async addEntry(entry: LeaderboardEntry): Promise<void> {
        await Promise.all(this.providers.map(p => p.addEntry(entry)));
    }

    /**
     * Return true if the score qualifies for a top slot in at least one
     * provider's list.
     */
    async isHighScore(score: number): Promise<boolean> {
        const results = await Promise.all(this.providers.map(p => p.isHighScore(score)));
        return results.some(r => r);
    }

    /** Return the last player name saved, or an empty string. */
    getLastPlayerName(): string {
        try {
            return localStorage.getItem(NAME_STORAGE_KEY) ?? "";
        }
        catch {
            return "";
        }
    }

    /** Persist the player name for pre-filling the name entry form next time. */
    savePlayerName(name: string): void {
        try {
            localStorage.setItem(NAME_STORAGE_KEY, name);
        }
        catch {
            // Storage may not be available in all contexts
        }
    }

    /**
     * Build a new LeaderboardEntry ready for addEntry().
     * The id is generated here so the same UUID can be used to highlight the
     * new row in the leaderboard table immediately after saving.
     */
    createEntry(name: string, score: number, timeRemaining: number): LeaderboardEntry {
        return {
            id: crypto.randomUUID(),
            name: name.trim() || "Player",
            score,
            timeRemaining: Math.max(0, timeRemaining),
            timestamp: Date.now(),
            source: "local",
        };
    }
}
