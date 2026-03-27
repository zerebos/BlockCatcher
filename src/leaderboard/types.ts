/**
 * A single leaderboard entry representing one completed game session.
 * The `id` field deduplicates entries across providers when multiple providers
 * (e.g. local + global) are active simultaneously.
 * The `source` field lets the UI distinguish local vs. global entries.
 */
export interface LeaderboardEntry {
    /** UUID generated client-side via crypto.randomUUID() */
    id: string;
    /** Player-provided display name */
    name: string;
    /** Final score at game end */
    score: number;
    /** Seconds remaining on the clock when the game ended */
    timeRemaining: number;
    /** Unix timestamp (ms) of when the entry was created */
    timestamp: number;
    /** Storage backend that owns this entry */
    source: "local" | "global";
}

/**
 * Async storage abstraction for leaderboard data.
 * Implement this interface to add new backends (e.g. Supabase).
 * LeaderboardManager accepts an array of providers and fans out reads/writes
 * to all of them, so local and global leaderboards can coexist.
 */
export interface LeaderboardProvider {
    /** Return all stored entries, sorted by score descending. */
    getEntries(): Promise<LeaderboardEntry[]>;
    /** Persist a new entry, evicting the lowest score if the store is full. */
    addEntry(entry: LeaderboardEntry): Promise<void>;
    /** Return true if the given score would appear in this provider's top list. */
    isHighScore(score: number): Promise<boolean>;
}
