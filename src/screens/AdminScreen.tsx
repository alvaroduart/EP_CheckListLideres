import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AdminCategoriasTab from '../components/AdminCategoriasTab';
import AdminHistoricoTab from '../components/AdminHistoricoTab';
import AdminSetoresTab from '../components/AdminSetoresTab';
import Button from '../components/Button';
import Header from '../components/Header';
import { listCategorias } from '../db/categoriasRepo';
import { listPessoas } from '../db/pessoasRepo';
import { alternarAtivoQuestao, excluirQuestao, listTodasQuestoes } from '../db/questoesRepo';
import { listSetores } from '../db/setoresRepo';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { Categoria, Pessoa, Questao, RootStackParamList, Setor } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Admin'>;
type Aba = 'perguntas' | 'categorias' | 'setores' | 'historico';

export default function AdminScreen({ navigation }: Props) {
  const [aba, setAba] = useState<Aba>('perguntas');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoadError(null);
    try {
      const [cats, qs, sets, ps] = await Promise.all([
        listCategorias(),
        listTodasQuestoes(),
        listSetores(),
        listPessoas(),
      ]);
      setCategorias(cats);
      setQuestoes(qs);
      setSetores(sets);
      setPessoas(ps);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar os dados.');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setLoading(true);
      await carregar();
      setLoading(false);
    });
    return unsubscribe;
  }, [navigation, carregar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }, [carregar]);

  const perguntasPorCategoria = useMemo(() => {
    const map: Record<string, number> = {};
    questoes.forEach((q) => {
      map[q.categoriaId] = (map[q.categoriaId] ?? 0) + 1;
    });
    return map;
  }, [questoes]);

  const pessoasPorSetor = useMemo(() => {
    const map: Record<string, number> = {};
    pessoas.forEach((p) => {
      map[p.setorId] = (map[p.setorId] ?? 0) + 1;
    });
    return map;
  }, [pessoas]);

  const gruposPerguntas = useMemo(() => {
    return categorias
      .map((categoria) => ({
        categoria,
        perguntas: questoes
          .filter((q) => q.categoriaId === categoria.id)
          .sort((a, b) => a.ordem - b.ordem),
      }))
      .filter((g) => g.perguntas.length > 0);
  }, [categorias, questoes]);

  const totalAtivas = questoes.filter((q) => q.ativo).length;

  const handleToggleAtivo = async (questao: Questao) => {
    setBusyId(questao.id);
    try {
      await alternarAtivoQuestao(questao.id, !questao.ativo);
      await carregar();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível atualizar.');
    } finally {
      setBusyId(null);
    }
  };

  const handleExcluir = (questao: Questao) => {
    Alert.alert(
      'Excluir pergunta',
      `Tem certeza que deseja excluir permanentemente:\n"${questao.pergunta}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setBusyId(questao.id);
            try {
              await excluirQuestao(questao.id);
              await carregar();
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível excluir.');
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    navigation.popToTop();
  };

  return (
    <View style={styles.flex}>
      <Header title="Administração" subtitle={`${totalAtivas} pergunta(s) ativa(s)`} badge="ADMIN" />
      <View style={styles.toolbar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabs}
          contentContainerStyle={styles.tabsContent}
        >
          <TabButton label="Perguntas" icon="checkbox-outline" active={aba === 'perguntas'} onPress={() => setAba('perguntas')} />
          <TabButton label="Categorias" icon="pricetags-outline" active={aba === 'categorias'} onPress={() => setAba('categorias')} />
          <TabButton label="Setores" icon="business-outline" active={aba === 'setores'} onPress={() => setAba('setores')} />
          <TabButton label="Histórico" icon="time-outline" active={aba === 'historico'} onPress={() => setAba('historico')} />
        </ScrollView>
        <Button label="Sair" variant="text" icon="log-out-outline" onPress={handleLogout} style={styles.logoutButton} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Ionicons name="hourglass-outline" size={28} color={colors.textSecondary} />
          <Text style={styles.infoText}>Carregando...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
          <Text style={styles.errorText}>{loadError}</Text>
          <Button label="Tentar novamente" icon="refresh" onPress={carregar} />
        </View>
      ) : aba === 'perguntas' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {gruposPerguntas.length === 0 && (
            <View style={styles.centered}>
              <Ionicons name="file-tray-outline" size={28} color={colors.textSecondary} />
              <Text style={styles.infoText}>Nenhuma pergunta cadastrada ainda.</Text>
            </View>
          )}
          {gruposPerguntas.map(({ categoria, perguntas }) => (
            <View key={categoria.id} style={styles.categoryBlock}>
              <View style={styles.categoryTitleRow}>
                <View style={[styles.categoryIconBadge, { backgroundColor: categoria.corFundo }]}>
                  <MaterialCommunityIcons name={categoria.icone} size={15} color={categoria.cor} />
                </View>
                <Text style={[styles.categoryTitle, { color: categoria.cor }]}>{categoria.nome}</Text>
              </View>
              {perguntas.map((questao) => (
                <View key={questao.id} style={[styles.questionCard, shadow.card, { borderLeftColor: categoria.cor }]}>
                  <View style={styles.questionRow}>
                    <Text style={[styles.questionText, !questao.ativo && styles.questionTextInativo]}>
                      {questao.pergunta}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: questao.ativo ? colors.successBg : colors.dangerBg },
                      ]}
                    >
                      <Ionicons
                        name={questao.ativo ? 'checkmark-circle' : 'close-circle'}
                        size={12}
                        color={questao.ativo ? colors.success : colors.danger}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: questao.ativo ? colors.success : colors.danger },
                        ]}
                      >
                        {questao.ativo ? 'Ativa' : 'Inativa'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionsRow}>
                    <ActionChip
                      icon="create-outline"
                      label="Editar"
                      color={colors.primary}
                      onPress={() => navigation.navigate('AdminQuestionForm', { questao })}
                      disabled={busyId === questao.id}
                    />
                    <ActionChip
                      icon={questao.ativo ? 'eye-off-outline' : 'eye-outline'}
                      label={questao.ativo ? 'Inativar' : 'Ativar'}
                      color={colors.warning}
                      onPress={() => handleToggleAtivo(questao)}
                      disabled={busyId === questao.id}
                    />
                    <ActionChip
                      icon="trash-outline"
                      label="Excluir"
                      color={colors.danger}
                      onPress={() => handleExcluir(questao)}
                      disabled={busyId === questao.id}
                    />
                  </View>
                </View>
              ))}
            </View>
          ))}
          <View style={styles.scrollSpacer} />
        </ScrollView>
      ) : aba === 'categorias' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <AdminCategoriasTab
            categorias={categorias}
            perguntasPorCategoria={perguntasPorCategoria}
            navigation={navigation}
            onChanged={carregar}
          />
          <View style={styles.scrollSpacer} />
        </ScrollView>
      ) : aba === 'setores' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <AdminSetoresTab
            setores={setores}
            pessoasPorSetor={pessoasPorSetor}
            navigation={navigation}
            onChanged={carregar}
          />
          <View style={styles.scrollSpacer} />
        </ScrollView>
      ) : (
        <AdminHistoricoTab />
      )}

      {aba === 'perguntas' && (
        <Pressable
          style={({ pressed }) => [styles.fab, shadow.button, pressed && styles.fabPressed]}
          onPress={() => navigation.navigate('AdminQuestionForm')}
          accessibilityRole="button"
          accessibilityLabel="Nova pergunta"
        >
          <Ionicons name="add" size={26} color={colors.textInverse} />
          <Text style={styles.fabLabel}>Nova Pergunta</Text>
        </Pressable>
      )}
    </View>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tabButton, active && styles.tabButtonActive, pressed && styles.tabButtonPressed]}
    >
      <Ionicons name={icon} size={14} color={active ? colors.textInverse : colors.textSecondary} />
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ActionChip({
  icon,
  label,
  color,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionChip,
        { borderColor: color },
        pressed && !disabled && styles.actionChipPressed,
        disabled && styles.actionChipDisabled,
      ]}
    >
      <Ionicons name={icon} size={14} color={color} style={styles.actionChipIcon} />
      <Text style={[styles.actionChipLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.backgroundAlt },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  tabs: {
    flexGrow: 0,
    flexShrink: 1,
  },
  tabsContent: {
    flexDirection: 'row',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    marginRight: spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonPressed: {
    opacity: 0.8,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  tabButtonTextActive: {
    color: colors.textInverse,
  },
  logoutButton: {
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
    flexShrink: 0,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 2,
  },
  scrollSpacer: {
    height: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryBlock: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIconBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  categoryTitle: {
    ...typography.sectionTitle,
  },
  questionCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  questionText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  questionTextInativo: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.sm,
  },
  actionChipPressed: {
    opacity: 0.75,
  },
  actionChipDisabled: {
    opacity: 0.4,
  },
  actionChipIcon: {
    marginRight: 4,
  },
  actionChipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabPressed: {
    transform: [{ scale: 0.97 }],
  },
  fabLabel: {
    color: colors.textInverse,
    fontWeight: '800',
    fontSize: 14,
    marginLeft: spacing.xs,
  },
});
