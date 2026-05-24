/** Format seconds as M:SS or H:MM:SS for timers. */
export function formatTimerDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/** Format seconds as a human-readable duration (e.g. "45 min", "1:30"). */
export function formatWorkoutDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));

  if (seconds >= 3600) {
    return formatTimerDuration(seconds);
  }

  if (seconds >= 60) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  }

  return formatTimerDuration(seconds);
}
