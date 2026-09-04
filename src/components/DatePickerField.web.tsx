import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';
import { formatDateISO } from '../utils/date';

interface DatePickerFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export default function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} style={styles.labelIcon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.input}>
        <input
          type="date"
          value={formatDateISO(value)}
          onChange={(e: any) => {
            const [y, m, d] = e.target.value.split('-').map(Number);
            if (y && m && d) onChange(new Date(y, m - 1, d));
          }}
          style={webInputStyle}
        />
      </View>
    </View>
  );
}

const webInputStyle: React.CSSProperties = {
  border: 'none',
  outline: 'none',
  fontSize: 15,
  fontWeight: 600,
  fontFamily: 'inherit',
  color: colors.textPrimary,
  backgroundColor: 'transparent',
  width: '100%',
};

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
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundAlt,
  },
});
