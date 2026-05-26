'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { WorkoutSession, LoggedExercise } from './types';

export function useWorkouts() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('workout_sessions')
        .select('id, date, exercises')
        .order('date', { ascending: false });

      if (data) {
        setSessions(data as WorkoutSession[]);
      }
      setIsLoaded(true);
    }
    load();
  }, []);

  const saveSession = useCallback(async (exercises: LoggedExercise[]): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const session: WorkoutSession = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      exercises,
    };

    const { error } = await supabase.from('workout_sessions').insert({
      id: session.id,
      user_id: user.id,
      date: session.date,
      exercises: session.exercises,
    });

    if (!error) {
      setSessions((prev) => [session, ...prev]);
    }
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

  const deleteSession = useCallback(async (id: string) => {
    const { error } = await supabase.from('workout_sessions').delete().eq('id', id);
    if (!error) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  }, []);

  return { sessions, saveSession, getLastPerformance, deleteSession, isLoaded };
}
