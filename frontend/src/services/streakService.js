import StorageService from './storage/StorageService';
import { getAllTasks } from './taskService';

const STREAK_CATEGORIES = ['Coding', 'Learning', 'Workout'];

const store = new StorageService('nexus_streak');

export { STREAK_CATEGORIES };

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const then = new Date(dateStr.slice(0, 10));
  const now = new Date(today());
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function getDefaultStreak(category) {
  return {
    id: category.toLowerCase(),
    category,
    currentStreak: 0,
    longestStreak: 0,
    lastUpdatedDate: null,
    history: [],
    resetCount: 0,
  };
}

export function getStreak(category) {
  const id = category.toLowerCase();
  const existing = store.get(id);
  return existing || getDefaultStreak(category);
}

export function getAllStreaks() {
  return STREAK_CATEGORIES.map((cat) => getStreak(cat));
}

function saveStreak(streak) {
  store.save(streak);
  return streak;
}

export function incrementStreak(category) {
  const streak = getStreak(category);
  const td = today();

  if (streak.lastUpdatedDate === td) return streak;

  streak.currentStreak += 1;
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }
  streak.lastUpdatedDate = td;
  streak.history.push({ date: td, action: 'increment' });
  return saveStreak({ ...streak });
}

export function resetStreak(category) {
  const streak = getStreak(category);
  const td = today();

  if (streak.currentStreak === 0) return streak;

  streak.history.push({ date: td, action: 'reset' });
  streak.resetCount += 1;
  streak.currentStreak = 0;
  streak.lastUpdatedDate = td;
  return saveStreak({ ...streak });
}

// Called on app load to validate and update all streaks
export function validateAllStreaks() {
  const tasks = getAllTasks();
  const td = today();

  STREAK_CATEGORIES.forEach((cat) => {
    const streak = getStreak(cat);

    const taskDoneToday = tasks.some(
      (t) => t.category === cat && t.status === 'Completed' && t.dueDate && t.dueDate.slice(0, 10) === td
    );

    if (taskDoneToday) {
      incrementStreak(cat);
    } else if (streak.lastUpdatedDate && daysSince(streak.lastUpdatedDate) >= 2) {
      resetStreak(cat);
    }
  });
}

export function markStreakFromTask(task) {
  if (task.status !== 'Completed') return null;
  const cat = task.category;
  if (!STREAK_CATEGORIES.includes(cat)) return null;
  return incrementStreak(cat);
}

export function getStreakSummary() {
  return STREAK_CATEGORIES.map((cat) => {
    const s = getStreak(cat);
    const td = today();
    const maintainedToday = s.lastUpdatedDate === td;
    return { category: cat, currentStreak: s.currentStreak, longestStreak: s.longestStreak, maintainedToday };
  });
}
