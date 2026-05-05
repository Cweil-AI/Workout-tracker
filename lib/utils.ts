import { WorkoutSession } from './types';

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(isoString);
}

export function getWorkoutsThisWeek(sessions: WorkoutSession[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return sessions.filter((s) => new Date(s.date) > weekAgo).length;
}

export function getMuscleGroupColor(group: string): string {
  const colors: Record<string, string> = {
    Chest: 'bg-red-500/20 text-red-400 border-red-500/30',
    Back: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Shoulders: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Legs: 'bg-green-500/20 text-green-400 border-green-500/30',
    Biceps: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Triceps: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  return colors[group] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}
