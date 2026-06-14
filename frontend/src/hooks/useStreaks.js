import { useState, useCallback, useEffect } from 'react';
import * as streakService from '../services/streakService';

export function useStreaks() {
  const [streaks, setStreaks] = useState(() => streakService.getAllStreaks());

  const refresh = useCallback(() => {
    setStreaks(streakService.getAllStreaks());
  }, []);

  useEffect(() => {
    streakService.validateAllStreaks();
    refresh();
  }, []);

  const summary = streaks.map((s) => ({
    category: s.category,
    currentStreak: s.currentStreak,
    longestStreak: s.longestStreak,
    maintainedToday: s.lastUpdatedDate === new Date().toISOString().slice(0, 10),
  }));

  return {
    streaks,
    summary,
    refresh,
  };
}
