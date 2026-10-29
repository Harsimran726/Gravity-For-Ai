// Keep periodic reads farther apart than Neon's five-minute idle timeout.
// The matching cron-job.org jobs use minutes 0, 20 and 40 of each hour.
export const BACKGROUND_INTERVAL_MINUTES = 20;
export const BACKGROUND_INTERVAL_MS = BACKGROUND_INTERVAL_MINUTES * 60_000;
export const SCHEDULER_STALE_AFTER_MS = BACKGROUND_INTERVAL_MS * 2 + 5 * 60_000;
