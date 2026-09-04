import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';

interface SelectFieldProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
}

export default function SelectField({
  label,
  options,
  value,
  onChange,
  icon,
  placeholder = 'Selecione uma opção',
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {icon ? <Ionicons name={icon} size={14} color={colors.textSecondary} style={styles.labelIcon} /> : null}
        <Text style={styles.label}>{label}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.input, pressed && styles.inputPressed]}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.value : styles.placeholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, shadow.button]} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView style={styles.optionsList} bounces={false}>
              {options.map((option) => {
                const selected = option === value;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.optionRow,
                      selected && styles.optionRowSelected,
                      pressed && styles.optionRowPressed,
                    ]}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {option}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={19} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable style={styles.cancelButton} onPress={() => setOpen(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  placeholder: {
    ...typography.body,
    color: colors.placeholder,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(16,18,35,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '70%',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sheetTitle: {
    ...typography.sectionTitle,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  optionsList: {
    flexGrow: 0,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  optionRowSelected: {
    backgroundColor: colors.card,
  },
  optionRowPressed: {
    opacity: 0.7,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  cancelButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'none',
  },
});
