/**
 * Manual verification helpers for polish step (runs in Node, no Expo runtime).
 * Usage: node scripts/verify-polish.mjs
 */

import assert from 'node:assert/strict';

function validateSetInput(values) {
  const weightTrimmed = values.weight.trim();
  const repsTrimmed = values.reps.trim();

  let weightError = null;
  let repsError = null;
  let weight = null;
  let reps = null;

  if (weightTrimmed.length === 0) {
    weightError = 'Enter weight';
  } else {
    const parsedWeight = parseFloat(weightTrimmed);
    if (Number.isNaN(parsedWeight)) {
      weightError = 'Weight must be a number';
    } else if (parsedWeight < 0) {
      weightError = 'Weight cannot be negative';
    } else {
      weight = parsedWeight;
    }
  }

  if (repsTrimmed.length === 0) {
    repsError = 'Enter reps';
  } else {
    const parsedReps = parseInt(repsTrimmed, 10);
    if (Number.isNaN(parsedReps) || !Number.isInteger(Number(repsTrimmed))) {
      repsError = 'Reps must be a whole number';
    } else if (parsedReps <= 0) {
      repsError = 'Reps must be greater than 0';
    } else {
      reps = parsedReps;
    }
  }

  return {
    weight,
    reps,
    weightError,
    repsError,
    isValid: weight !== null && reps !== null,
  };
}

function formatWorkoutDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  if (seconds >= 60) {
    return `${Math.round(seconds / 60)} min`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// Set input validation
assert.equal(validateSetInput({ weight: '50', reps: '10' }).isValid, true);
assert.equal(validateSetInput({ weight: '0', reps: '12' }).isValid, true);
assert.equal(validateSetInput({ weight: '-5', reps: '10' }).isValid, false);
assert.equal(validateSetInput({ weight: '50', reps: '0' }).isValid, false);
assert.equal(validateSetInput({ weight: '50', reps: '-2' }).isValid, false);
assert.equal(validateSetInput({ weight: 'abc', reps: '10' }).weightError, 'Weight must be a number');
assert.equal(validateSetInput({ weight: '50', reps: '1.5' }).repsError, 'Reps must be a whole number');

// Duration formatting for history display
assert.equal(formatWorkoutDuration(2700), '45 min');
assert.equal(formatWorkoutDuration(90), '2 min');
assert.equal(formatWorkoutDuration(45), '0:45');

console.log('Polish verification passed (set validation + duration formatting).');
