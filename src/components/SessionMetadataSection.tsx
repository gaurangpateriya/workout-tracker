import { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View as RNView,
} from 'react-native';

import { Text } from '@/components/Themed';
import { updateSessionMetadata } from '@/src/db/queries/sessions';
import { useTheme } from '@/src/hooks/useTheme';
import { showAlert } from '@/src/utils/alert';

interface SessionMetadataSectionProps {
  sessionId: string;
  bodyWeight: number | null;
  onUpdate?: (metadata: { bodyWeight: number | null }) => void;
}

function parseBodyWeightInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 10) / 10;
}

export function SessionMetadataSection({
  sessionId,
  bodyWeight,
  onUpdate,
}: SessionMetadataSectionProps) {
  const { colors } = useTheme();
  const [weightInput, setWeightInput] = useState(
    bodyWeight != null ? String(bodyWeight) : ''
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWeightInput(bodyWeight != null ? String(bodyWeight) : '');
  }, [bodyWeight]);

  const saveMetadata = useCallback(
    async (nextWeight: number | null) => {
      setSaving(true);
      try {
        await updateSessionMetadata(sessionId, {
          bodyWeight: nextWeight,
        });
        onUpdate?.({ bodyWeight: nextWeight });
      } catch (err) {
        showAlert(
          'Save Failed',
          err instanceof Error ? err.message : 'Could not save session details.'
        );
      } finally {
        setSaving(false);
      }
    },
    [onUpdate, sessionId]
  );

  const handleWeightBlur = async () => {
    const parsed = parseBodyWeightInput(weightInput);
    const current = bodyWeight;

    if (parsed === current) {
      return;
    }

    if (weightInput.trim() && parsed === null) {
      showAlert('Invalid Weight', 'Enter a positive number in kg.');
      setWeightInput(current != null ? String(current) : '');
      return;
    }

    await saveMetadata(parsed);
  };

  return (
    <RNView
      style={[
        styles.card,
        { borderColor: colors.border, backgroundColor: colors.card },
      ]}
    >
      <Text style={styles.sectionTitle}>Body Tracking</Text>

      <Text style={[styles.label, { color: colors.muted }]}>Body Weight (kg)</Text>
      <TextInput
        value={weightInput}
        onChangeText={setWeightInput}
        onBlur={handleWeightBlur}
        placeholder="e.g. 75.5"
        placeholderTextColor={colors.placeholder}
        keyboardType="decimal-pad"
        editable={!saving}
        style={[
          styles.weightInput,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      />
    </RNView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  weightInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 17,
  },
});
