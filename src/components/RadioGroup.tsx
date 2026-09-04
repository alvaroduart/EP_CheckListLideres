import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

interface RadioGroupProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function RadioGroup({ label, options, value, onChange, icon }: RadioGroupProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {icon ? <Ionicons name={icon} size={14} color={colors.textSecondary} style={styles.labelIcon} /> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.options}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(option)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              {selected ? (
                <Ionicons name="checkmark-circle" size={15} color={colors.textInverse} style={styles.checkIcon} />
              ) : null}
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
    marginBottom: spacing.sm,
  },
  labelIcon: {
    marginRight: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  checkIcon: {
    marginRight: spacing.xs,
  },
  optionLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionLabelSelected: {
    color: colors.textInverse,
  },
});
