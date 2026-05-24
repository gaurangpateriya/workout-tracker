import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View as RNView,
} from 'react-native';

import { Text } from '@/components/Themed';
import { useTheme } from '@/src/hooks/useTheme';
import { formatTimerDuration } from '@/src/utils/formatDuration';
import { validateSetInput } from '@/src/utils/validateSetInput';

interface SetInputRowProps {
  onStartSet: () => void;
  onEndSet: (
    weight: number,
    reps: number,
    setDurationSeconds: number
  ) => Promise<void>;
  disabled?: boolean;
  isSetActive: boolean;
  isAnotherSetActive: boolean;
  setStartedAt: number | null;
}

export function SetInputRow({
  onStartSet,
  onEndSet,
  disabled = false,
  isSetActive,
  isAnotherSetActive,
  setStartedAt,
}: SetInputRowProps) {
  const { colors } = useTheme();

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isSetActive || setStartedAt === null) {
      setElapsed(0);
      return;
    }

    const tick = () => {
      setElapsed(Math.floor((Date.now() - setStartedAt) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isSetActive, setStartedAt]);

  useEffect(() => {
    if (!isSetActive) {
      setWeight('');
      setReps('');
      setShowErrors(false);
    }
  }, [isSetActive]);

  const validation = validateSetInput({ weight, reps });

  const handleEndSet = async () => {
    const result = validateSetInput({ weight, reps });
    if (!result.isValid || result.weight === null || result.reps === null) {
      setShowErrors(true);
      return;
    }

    if (setStartedAt === null) {
      return;
    }

    const setDurationSeconds = Math.max(
      0,
      Math.round((Date.now() - setStartedAt) / 1000)
    );

    setSaving(true);
    try {
      await onEndSet(result.weight, result.reps, setDurationSeconds);
      setWeight('');
      setReps('');
      setShowErrors(false);
    } finally {
      setSaving(false);
    }
  };

  const weightBorderColor =
    showErrors && validation.weightError ? colors.error : colors.border;
  const repsBorderColor =
    showErrors && validation.repsError ? colors.error : colors.border;

  if (!isSetActive) {
    return (
      <RNView style={styles.wrapper}>
        <Pressable
          onPress={onStartSet}
          disabled={disabled || isAnotherSetActive}
          style={({ pressed }) => [
            styles.startButton,
            {
              borderColor: colors.tint,
              opacity: disabled || isAnotherSetActive ? 0.4 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.startLabel, { color: colors.tint }]}>
            Start Set
          </Text>
        </Pressable>
      </RNView>
    );
  }

  return (
    <RNView style={styles.wrapper}>
      <Text style={[styles.setTimer, { color: colors.tint }]}>
        Set: {formatTimerDuration(elapsed)}
      </Text>
      <RNView style={styles.row}>
        <TextInput
          value={weight}
          onChangeText={(value) => {
            setWeight(value);
            if (showErrors) {
              setShowErrors(false);
            }
          }}
          placeholder="kg"
          placeholderTextColor={colors.placeholder}
          keyboardType="decimal-pad"
          editable={!disabled && !saving}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: weightBorderColor,
              backgroundColor: colors.card,
            },
          ]}
        />
        <TextInput
          value={reps}
          onChangeText={(value) => {
            setReps(value);
            if (showErrors) {
              setShowErrors(false);
            }
          }}
          placeholder="reps"
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
          editable={!disabled && !saving}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: repsBorderColor,
              backgroundColor: colors.card,
            },
          ]}
        />
      </RNView>
      <Pressable
        onPress={handleEndSet}
        disabled={disabled || saving}
        style={({ pressed }) => [
          styles.endButton,
          {
            backgroundColor: colors.tint,
            opacity: disabled || saving ? 0.4 : pressed ? 0.7 : 1,
          },
        ]}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.buttonText} />
        ) : (
          <Text style={[styles.endLabel, { color: colors.buttonText }]}>
            End Set
          </Text>
        )}
      </Pressable>
      {showErrors && (validation.weightError || validation.repsError) ? (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {[validation.weightError, validation.repsError]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      ) : null}
    </RNView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    gap: 8,
    width: '100%',
  },
  startButton: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  startLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  setTimer: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  input: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  endButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  endLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
  },
});
