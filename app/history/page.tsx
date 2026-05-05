'use client';

import { useState } from 'react';
import { useWorkouts } from '@/lib/hooks';
import { formatDate, getMuscleGroupColor } from '@/lib/utils';
import { MuscleGroup } from '@/lib/types';
import { MUSCLE_GROUPS } from '@/lib/exercises';

type Filter = MuscleGroup | 'All';

export default function History() {
  const { sessions, deleteSession, isLoaded } = useWorkouts();
  const [filter, setFilter] = useState<Filter>('All');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isLoaded) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const filtered =
    filter === 'All'
      ? sessions
      : sessions.filter((s) => s.exercises.some((e) => e.muscleGroup === filter));

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      deleteSession(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">History</h1>
        <span className="text-gray-500 text-sm">{filtered.length} workouts</span>
      </div>

      {/* Filter by muscle group */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['All', ...MUSCLE_GROUPS] as Filter[]).map((group) => (
          <button
            key={group}
            onClick={() => setFilter(group)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === group
                ? group === 'All'
                  ? 'bg-white text-gray-900 border-white'
                  : getMuscleGroupColor(group)
                : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
          <p className="text-gray-400">No workouts found.</p>
          {filter !== 'All' && (
            <button
              onClick={() => setFilter('All')}
              className="text-blue-400 text-sm mt-2 hover:text-blue-300"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => {
            const isOpen = expanded.has(session.id);
            const muscleGroups = [...new Set(session.exercises.map((e) => e.muscleGroup))];
            const totalSets = session.exercises.reduce((sum, e) => sum + e.sets.length, 0);

            return (
              <div
                key={session.id}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(session.id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{formatDate(session.date)}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {session.exercises.length}{' '}
                      {session.exercises.length === 1 ? 'exercise' : 'exercises'} &bull; {totalSets}{' '}
                      {totalSets === 1 ? 'set' : 'sets'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {muscleGroups.map((group) => (
                        <span
                          key={group}
                          className={`text-xs px-2 py-0.5 rounded-full border ${getMuscleGroupColor(group)}`}
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-gray-500 text-lg font-light shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-800 px-4 pt-4 pb-4 space-y-5">
                    {session.exercises.map((ex, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-gray-100 text-sm">{ex.exerciseName}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${getMuscleGroupColor(ex.muscleGroup)}`}
                          >
                            {ex.muscleGroup}
                          </span>
                        </div>
                        <div className="space-y-1 pl-2 border-l-2 border-gray-800">
                          {ex.sets.map((set, j) => (
                            <p key={j} className="text-gray-400 text-sm">
                              Set {j + 1}:{' '}
                              <span className="text-gray-200 font-medium">
                                {set.weight} {set.unit}
                              </span>{' '}
                              &times;{' '}
                              <span className="text-gray-200 font-medium">{set.reps} reps</span>
                            </p>
                          ))}
                          {ex.notes && (
                            <p className="text-gray-500 text-xs italic pt-0.5">{ex.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-gray-800/50">
                      {confirmDelete === session.id ? (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-xs">Delete this workout?</span>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="text-red-400 text-xs hover:text-red-300 font-medium"
                          >
                            Yes, delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-gray-500 text-xs hover:text-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                        >
                          Delete workout
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
