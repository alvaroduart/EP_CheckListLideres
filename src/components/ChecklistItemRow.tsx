import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Pessoa, RespostaDetalhe, RespostaValor } from '../types';
import PhotoCapture from './PhotoCapture';
import SelectField from './SelectField';
import TextField from './TextField';

const NINGUEM = 'Ninguém';

interface ChecklistItemRowProps {
  pergunta: string;
  valor?: RespostaValor;
  onChange: (valor: RespostaValor) => void;
  detalhe: RespostaDetalhe;
  onChangeDetalhe: (patch: Partial<RespostaDetalhe>) => void;
  pessoas: Pessoa[];
}

export default function ChecklistItemRow({
  pergunta,
  valor,
  onChange,
  detalhe,
  onChangeDetalhe,
  pessoas,
}: ChecklistItemRowProps) {
  const opcoesAtribuir = [NINGUEM, ...pessoas.map((p) => p.nome)];

  const handleSelecionarAtribuido = (nome: string) => {
    if (nome === NINGUEM) {
      onChangeDetalhe({ atribuidoAId: null, atribuidoANome: null });
      return;
    }
    const pessoa = pessoas.find((p) => p.nome === nome);
    onChangeDetalhe({ atribuidoAId: pessoa?.id ?? null, atribuidoANome: pessoa?.nome ?? null });
  };

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

      {valor === 'Não' && (
        <View style={styles.detalheBox}>
          <TextField
            label="Comentário"
            placeholder="O que foi observado?"
            value={detalhe.comentario}
            onChangeText={(texto) => onChangeDetalhe({ comentario: texto })}
            multiline
            numberOfLines={2}
            style={styles.comentarioInput}
            icon="chatbubble-ellipses-outline"
          />
          <PhotoCapture
            fotoUri={detalhe.fotoUri}
            onChange={(uri) => onChangeDetalhe({ fotoUri: uri })}
          />
          <View style={styles.atribuirWrap}>
            <SelectField
              label="Atribuir tarefa a"
              options={opcoesAtribuir}
              value={detalhe.atribuidoANome ?? NINGUEM}
              onChange={handleSelecionarAtribuido}
              icon="person-add-outline"
              placeholder={NINGUEM}
            />
          </View>
        </View>
      )}
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
  detalheBox: {
    marginLeft: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  comentarioInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  atribuirWrap: {
    marginTop: spacing.xs,
  },
});
