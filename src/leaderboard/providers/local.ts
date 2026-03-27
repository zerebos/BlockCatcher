import type {LeaderboardEntry, LeaderboardProvider} from "../types";

const STORAGE_KEY = "blockcatcher_leaderboard";
const MAX_ENTRIES = 10;

/**
 * Leaderboard provider backed by localStorage.
 * All operations are wrapped in Promises so the API matches the
 * LeaderboardProvider interface — a Supabase (or other remote) provider
 * can be swapped in without touching the call sites.
 */
export default class LocalLeaderboardProvider implements LeaderboardProvider {
    async getEntries(): Promise<LeaderboardEntry[]> {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            return JSON.parse(raw) as LeaderboardEntry[];
        }
        catch {
            return [];
        }
    }

    async addEntry(entry: LeaderboardEntry): Promise<void> {
        const entries = await this.getEntries();
        entries.push(entry);
        entries.sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);
        const trimmed = entries.slice(0, MAX_ENTRIES);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        }
        catch {
            // Storage quota exceeded — silently skip persistence
        }
    }

    async isHighScore(score: number): Promise<boolean> {
        const entries = await this.getEntries();
        if (entries.length < MAX_ENTRIES) return true;
        return score > entries[entries.length - 1].score;
    }
}
