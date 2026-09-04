import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';
import { RespostaValor } from '../types';
import PhotoCapture from './PhotoCapture';

interface ChecklistItemRowProps {
  pergunta: string;
  valor?: RespostaValor;
  onChange: (valor: RespostaValor) => void;
  fotoUri?: string | null;
  onChangeFoto: (uri: string | null) => void;
}

export default function ChecklistItemRow({
  pergunta,
  valor,
  onChange,
  fotoUri,
  onChangeFoto,
}: ChecklistItemRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.perguntaRow}>
        <View style={[styles.dot, valor && styles.dotAnswered]} />
        <Text style={styles.pergunta}>{pergunta}</Text>
      </View>
      <View style={styles.options}>
        <ToggleOption
          label="Sim"
          icon="checkmark-circle"
          selected={valor === 'Sim'}
          kind="success"
          onPress={() => onChange('Sim')}
        />
        <ToggleOption
          label="Não"
          icon="close-circle"
          selected={valor === 'Não'}
          kind="danger"
          onPress={() => onChange('Não')}
        />
      </View>
      <View style={styles.photoRow}>
        <PhotoCapture fotoUri={fotoUri} onChange={onChangeFoto} />
      </View>
    </View>
  );
}

function ToggleOption({
  label,
  icon,
  selected,
  kind,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  kind: 'success' | 'danger';
  onPress: () => void;
}) {
  const palette = kind === 'success'
    ? { bg: colors.success, bgUnselected: colors.successBg, text: colors.success }
    : { bg: colors.danger, bgUnselected: colors.dangerBg, text: colors.danger };

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        { backgroundColor: selected ? palette.bg : palette.bgUnselected },
        pressed && styles.optionPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={selected ? colors.textInverse : palette.text}
        style={styles.optionIcon}
      />
      <Text style={[styles.optionLabel, { color: selected ? colors.textInverse : palette.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  perguntaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  dotAnswered: {
    backgroundColor: colors.primaryLight,
  },
  pergunta: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  options: {
    flexDirection: 'row',
    marginLeft: spacing.lg,
  },
  photoRow: {
    marginLeft: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
    minWidth: 88,
    justifyContent: 'center',
  },
  optionPressed: {
    transform: [{ scale: 0.96 }],
  },
  optionIcon: {
    marginRight: spacing.xs,
  },
  optionLabel: {
    ...typography.label,
    textTransform: 'none',
  },
});
