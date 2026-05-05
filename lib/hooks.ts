'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkoutSession, LoggedExercise } from './types';

const STORAGE_KEY = 'workout_sessions_v1';

export function useWorkouts() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSessions(JSON.parse(raw));
    } catch {
      setSessions([]);
    }
    setIsLoaded(true);
  }, []);

  const saveSession = useCallback((exercises: LoggedExercise[]): string => {
    const session: WorkoutSession = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      exercises,
    };
    setSessions((prev) => {
      const updated = [session, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    return session.id;
  }, []);

  const getLastPerformance = useCallback(
    (exerciseName: string) => {
      for (const session of sessions) {
        const ex = session.exercises.find((e) => e.exerciseName === exerciseName);
        if (ex) return { date: session.date, sets: ex.sets };
      }
      return null;
    },
    [sessions]
  );

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { sessions, saveSession, getLastPerformance, deleteSession, isLoaded };
}
