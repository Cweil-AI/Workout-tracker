'use client';

import Link from 'next/link';
import { useWorkouts } from '@/lib/hooks';
import { formatRelativeDate, getMuscleGroupColor, getWorkoutsThisWeek } from '@/lib/utils';

export default function Dashboard() {
  const { sessions, isLoaded } = useWorkouts();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const recentSessions = sessions.slice(0, 5);
  const thisWeek = getWorkoutsThisWeek(sessions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Workout Tracker</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider">This Week</p>
          <p className="text-3xl font-bold text-white mt-1">{thisWeek}</p>
          <p className="text-gray-500 text-xs">workouts</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider">All Time</p>
          <p className="text-3xl font-bold text-white mt-1">{sessions.length}</p>
          <p className="text-gray-500 text-xs">workouts</p>
        </div>
      </div>

      <Link
        href="/log"
        className="block w-full bg-blue-600 hover:bg-blue-500 text-white text-center font-semibold py-4 rounded-xl transition-colors"
      >
        Log Workout
      </Link>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Recent Workouts</h2>
        {recentSessions.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <p className="text-gray-400">No workouts yet.</p>
            <p className="text-gray-500 text-sm mt-1">Tap &ldquo;Log Workout&rdquo; to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => {
              const muscleGroups = [...new Set(session.exercises.map((e) => e.muscleGroup))];
              const totalSets = session.exercises.reduce((sum, e) => sum + e.sets.length, 0);
              return (
                <div key={session.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{formatRelativeDate(session.date)}</p>
                    <p className="text-gray-500 text-sm">
                      {totalSets} {totalSets === 1 ? 'set' : 'sets'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {muscleGroups.map((group) => (
                      <span
                        key={group}
                        className={`text-xs px-2 py-0.5 rounded-full border ${getMuscleGroupColor(group)}`}
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    {session.exercises.map((ex, i) => (
                      <p key={i} className="text-gray-400 text-sm">
                        {ex.exerciseName} &mdash; {ex.sets.length}{' '}
                        {ex.sets.length === 1 ? 'set' : 'sets'}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {sessions.length > 5 && (
        <Link
          href="/history"
          className="block text-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          View all {sessions.length} workouts
        </Link>
      )}
    </div>
  );
}
