import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { Categoria, Pessoa, Questao, RespostaDetalhe, RespostaValor } from '../types';
import ChecklistItemRow from './ChecklistItemRow';

const DETALHE_VAZIO: RespostaDetalhe = {
  comentario: '',
  fotoUri: null,
  atribuidoAId: null,
  atribuidoANome: null,
};

interface CategorySectionProps {
  categoria: Categoria;
  perguntas: Questao[];
  respostas: Record<string, RespostaValor>;
  onChangeResposta: (perguntaId: string, valor: RespostaValor) => void;
  detalhes: Record<string, RespostaDetalhe>;
  onChangeDetalhe: (perguntaId: string, patch: Partial<RespostaDetalhe>) => void;
  pessoas: Pessoa[];
  defaultExpanded?: boolean;
}

export default function CategorySection({
  categoria,
  perguntas,
  respostas,
  onChangeResposta,
  detalhes,
  onChangeDetalhe,
  pessoas,
  defaultExpanded = true,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  const respondidas = perguntas.filter((p) => respostas[p.id]).length;
  const completo = perguntas.length > 0 && respondidas === perguntas.length;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded, rotation]);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  const rotateDeg = rotation.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });

  return (
    <View style={[styles.card, shadow.card]}>
      <Pressable style={styles.header} onPress={toggle}>
        <View style={[styles.headerBg, { backgroundColor: categoria.cor }]}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name={categoria.icone} size={20} color={colors.textInverse} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.categoria} numberOfLines={1}>
              {categoria.nome}
            </Text>
            <View style={styles.progressRow}>
              {completo ? (
                <Ionicons name="checkmark-done-circle" size={13} color={colors.textInverse} style={styles.completoIcon} />
              ) : null}
              <Text style={styles.progresso}>
                {respondidas}/{perguntas.length} respondidas
              </Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ rotate: rotateDeg }] }}>
            <Ionicons name="chevron-down" size={20} color={colors.textInverse} />
          </Animated.View>
        </View>
      </Pressable>
      {expanded && (
        <View style={styles.body}>
          {perguntas.map((questao) => (
            <ChecklistItemRow
              key={questao.id}
              pergunta={questao.pergunta}
              valor={respostas[questao.id]}
              onChange={(valor) => onChangeResposta(questao.id, valor)}
              detalhe={detalhes[questao.id] ?? DETALHE_VAZIO}
              onChangeDetalhe={(patch) => onChangeDetalhe(questao.id, patch)}
              pessoas={pessoas}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  header: {},
  headerBg: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  categoria: {
    ...typography.sectionTitle,
    color: colors.textInverse,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  completoIcon: {
    marginRight: 4,
  },
  progresso: {
    fontSize: 12,
    color: colors.textInverse,
    opacity: 0.9,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
});
