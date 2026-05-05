'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkouts } from '@/lib/hooks';
import { MUSCLE_GROUPS, EXERCISES } from '@/lib/exercises';
import { MuscleGroup, LoggedExercise, WorkoutSet } from '@/lib/types';
import { formatDate, getMuscleGroupColor } from '@/lib/utils';

export default function LogWorkout() {
  const { saveSession, getLastPerformance, isLoaded } = useWorkouts();
  const router = useRouter();

  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | ''>('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState<WorkoutSet[]>([{ weight: '', reps: '', unit: 'lbs' }]);
  const [addedExercises, setAddedExercises] = useState<LoggedExercise[]>([]);
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const lastPerformance = selectedExercise ? getLastPerformance(selectedExercise) : null;
  const availableExercises = selectedMuscleGroup ? EXERCISES[selectedMuscleGroup] : [];

  function handleMuscleGroupChange(group: MuscleGroup) {
    setSelectedMuscleGroup(group);
    setSelectedExercise('');
    setSets([{ weight: '', reps: '', unit }]);
  }

  function handleExerciseChange(exercise: string) {
    setSelectedExercise(exercise);
    setNotes('');
    const last = getLastPerformance(exercise);
    if (last) {
      setSets(last.sets.map((s) => ({ weight: s.weight, reps: s.reps, unit })));
    } else {
      setSets([{ weight: '', reps: '', unit }]);
    }
  }

  function updateSet(index: number, field: 'weight' | 'reps', value: string) {
    setSets((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addSet() {
    setSets((prev) => [...prev, { weight: '', reps: '', unit }]);
  }

  function removeSet(index: number) {
    if (sets.length === 1) return;
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  function getValidSets(): WorkoutSet[] {
    return sets.filter((s) => s.weight !== '' && s.reps !== '').map((s) => ({ ...s, unit }));
  }

  function addExercise() {
    if (!selectedMuscleGroup || !selectedExercise) return;
    const validSets = getValidSets();
    if (validSets.length === 0) {
      setError('Please enter weight and reps for at least one set.');
      return;
    }
    setError('');
    setAddedExercises((prev) => [
      ...prev,
      { muscleGroup: selectedMuscleGroup, exerciseName: selectedExercise, sets: validSets, notes: notes.trim() || undefined },
    ]);
    setSelectedMuscleGroup('');
    setSelectedExercise('');
    setSets([{ weight: '', reps: '', unit }]);
    setNotes('');
  }

  function finishWorkout() {
    let allExercises = [...addedExercises];
    if (selectedMuscleGroup && selectedExercise) {
      const validSets = getValidSets();
      if (validSets.length > 0) {
        allExercises = [
          ...allExercises,
          { muscleGroup: selectedMuscleGroup, exerciseName: selectedExercise, sets: validSets, notes: notes.trim() || undefined },
        ];
      }
    }
    if (allExercises.length === 0) {
      setError('Add at least one exercise with sets before finishing.');
      return;
    }
    setError('');
    saveSession(allExercises);
    setSaved(true);
    setTimeout(() => router.push('/'), 1200);
  }

  if (!isLoaded) {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
          <span className="text-green-400 text-2xl font-bold">&#10003;</span>
        </div>
        <p className="text-xl font-semibold text-white">Workout Saved!</p>
        <p className="text-gray-400 text-sm">Taking you back to the dashboard...</p>
      </div>
    );
  }

  const canFinish =
    addedExercises.length > 0 ||
    (selectedExercise !== '' && getValidSets().length > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Log Workout</h1>

      {/* Already-added exercises */}
      {addedExercises.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Added to this workout</p>
          {addedExercises.map((ex, i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-3 border border-gray-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-white text-sm">{ex.exerciseName}</p>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${getMuscleGroupColor(ex.muscleGroup)}`}
                  >
                    {ex.muscleGroup}
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    {ex.sets.map((s, j) => (
                      <span key={j} className="text-gray-400 text-xs">
                        Set {j + 1}: {s.weight} {s.unit} &times; {s.reps} reps
                      </span>
                    ))}
                  </div>
                  {ex.notes && (
                    <p className="text-gray-500 text-xs mt-1 italic">{ex.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => setAddedExercises((prev) => prev.filter((_, j) => j !== i))}
                  className="text-gray-600 hover:text-red-400 transition-colors text-xs shrink-0"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unit toggle */}
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">Weight unit:</span>
        <div className="flex bg-gray-800 rounded-lg p-1">
          {(['lbs', 'kg'] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                unit === u ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Muscle group selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Step 1 &mdash; Select Muscle Group
        </label>
        <div className="grid grid-cols-3 gap-2">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => handleMuscleGroupChange(group)}
              className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors border ${
                selectedMuscleGroup === group
                  ? getMuscleGroupColor(group)
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600 hover:text-gray-200'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise selection */}
      {selectedMuscleGroup && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Step 2 &mdash; Select Exercise
          </label>
          <select
            value={selectedExercise}
            onChange={(e) => handleExerciseChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="">Choose an exercise...</option>
            {availableExercises.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Last performance */}
      {lastPerformance && (
        <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-4">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Last time &mdash; {formatDate(lastPerformance.date)}
          </p>
          <div className="space-y-1">
            {lastPerformance.sets.map((s, i) => (
              <p key={i} className="text-gray-300 text-sm">
                Set {i + 1}:{' '}
                <span className="font-semibold text-white">
                  {s.weight} {s.unit}
                </span>{' '}
                &times;{' '}
                <span className="font-semibold text-white">{s.reps} reps</span>
              </p>
            ))}
          </div>
          <p className="text-blue-500/70 text-xs mt-2">Sets pre-filled from last time &mdash; edit as needed</p>
        </div>
      )}

      {/* Sets entry */}
      {selectedExercise && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            Step 3 &mdash; Enter Your Sets
          </label>

          <div className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-2 text-xs text-gray-500 px-1">
            <span>Set</span>
            <span>Weight ({unit})</span>
            <span>Reps</span>
            <span />
          </div>

          {sets.map((set, i) => (
            <div key={i} className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-2 items-center">
              <span className="text-gray-500 text-sm text-center font-medium">{i + 1}</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={set.weight}
                onChange={(e) => updateSet(i, 'weight', e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500 w-full"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={set.reps}
                onChange={(e) => updateSet(i, 'reps', e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500 w-full"
              />
              <button
                onClick={() => removeSet(i)}
                disabled={sets.length === 1}
                className="flex items-center justify-center h-12 w-12 text-gray-600 hover:text-red-400 disabled:opacity-20 transition-colors text-xl"
              >
                &times;
              </button>
            </div>
          ))}

          <button
            onClick={addSet}
            className="w-full py-2 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 text-sm transition-colors"
          >
            + Add Set
          </button>

          <div className="space-y-1.5 pt-1">
            <label className="text-sm font-medium text-gray-300">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. felt strong, increased weight, used cables instead..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none placeholder-gray-600"
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        {selectedExercise && addedExercises.length >= 0 && (
          <button
            onClick={addExercise}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors border border-gray-700"
          >
            + Add Another Exercise
          </button>
        )}

        <button
          onClick={finishWorkout}
          disabled={!canFinish}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          Finish &amp; Save Workout
        </button>
      </div>
    </div>
  );
}
