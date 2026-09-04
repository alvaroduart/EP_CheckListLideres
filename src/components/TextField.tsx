import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function TextField({ label, icon, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {icon ? <Ionicons name={icon} size={14} color={colors.textSecondary} style={styles.labelIcon} /> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <TextInput
        placeholderTextColor={colors.placeholder}
        style={[styles.input, style]}
        {...rest}
      />
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
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundAlt,
    color: colors.textPrimary,
    ...typography.body,
  },
});
