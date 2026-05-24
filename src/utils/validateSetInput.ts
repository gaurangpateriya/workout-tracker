export interface SetInputValues {
  weight: string;
  reps: string;
}

export interface SetInputValidation {
  weight: number | null;
  reps: number | null;
  weightError: string | null;
  repsError: string | null;
  isValid: boolean;
}

export function validateSetInput(values: SetInputValues): SetInputValidation {
  const weightTrimmed = values.weight.trim();
  const repsTrimmed = values.reps.trim();

  let weightError: string | null = null;
  let repsError: string | null = null;
  let weight: number | null = null;
  let reps: number | null = null;

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

export function assertValidSetInput(weight: number, reps: number): void {
  if (Number.isNaN(weight) || weight < 0) {
    throw new Error('Weight must be zero or greater');
  }
  if (!Number.isInteger(reps) || reps <= 0) {
    throw new Error('Reps must be a whole number greater than 0');
  }
}
