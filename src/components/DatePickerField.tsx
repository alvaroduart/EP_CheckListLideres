import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';
import { formatDateBR } from '../utils/date';
import Button from './Button';

interface DatePickerFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export default function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && selected) onChange(selected);
      return;
    }
    if (selected) onChange(selected);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} style={styles.labelIcon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.input, pressed && styles.inputPressed]}
        onPress={() => setShow(true)}
      >
        <Text style={styles.value}>{formatDateBR(value)}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>

      {show && Platform.OS === 'android' && (
        <DateTimePicker value={value} mode="date" display="default" onChange={handleChange} />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="slide" onRequestClose={() => setShow(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <DateTimePicker value={value} mode="date" display="inline" onChange={handleChange} />
              <Button label="Concluído" onPress={() => setShow(false)} style={styles.doneButton} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  labelIcon: {
    marginRight: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundAlt,
  },
  inputPressed: {
    opacity: 0.85,
  },
  value: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16,18,35,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
  },
  doneButton: {
    marginTop: spacing.sm,
  },
});
