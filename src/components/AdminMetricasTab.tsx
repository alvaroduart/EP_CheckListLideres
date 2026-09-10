import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getMetricasGlobais,
  listMetricasCategoria,
  listMetricasPergunta,
  listMetricasSetor,
} from '../db/metricasRepo';
import { useIsWideWeb } from '../hooks/useResponsive';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { MetricaCategoria, MetricaGlobal, MetricaPergunta, MetricaSetor } from '../types';
import Button from './Button';

function calcularConformidade(sim: number, nao: number): number | null {
  const total = sim + nao;
  if (total === 0) return null;
  return (sim / total) * 100;
}

function corConformidade(pct: number): string {
  if (pct >= 90) return colors.success;
  if (pct >= 70) return colors.warning;
  return colors.danger;
}

const GLOBAL_VAZIO: MetricaGlobal = { totalChecklists: 0, totalRespostas: 0, totalSim: 0, totalNao: 0 };

export default function AdminMetricasTab() {
  const isWideWeb = useIsWideWeb();
  const [global, setGlobal] = useState<MetricaGlobal>(GLOBAL_VAZIO);
  const [categorias, setCategorias] = useState<MetricaCategoria[]>([]);
  const [setores, setSetores] = useState<MetricaSetor[]>([]);
  const [perguntas, setPerguntas] = useState<MetricaPergunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setError(null);
    try {
      const [g, cats, sets, perg] = await Promise.all([
        getMetricasGlobais(),
        listMetricasCategoria(),
        listMetricasSetor(),
        listMetricasPergunta(),
      ]);
      setGlobal(g);
      setCategorias(cats);
      setSetores(sets);
      setPerguntas(perg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar as métricas.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await carregar();
      setLoading(false);
    })();
  }, [carregar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }, [carregar]);

  const conformidadeGlobal = calcularConformidade(global.totalSim, global.totalNao);

  const categoriasOrdenadas = [...categorias].sort((a, b) => {
    const pctA = calcularConformidade(a.totalSim, a.totalNao) ?? 100;
    const pctB = calcularConformidade(b.totalSim, b.totalNao) ?? 100;
    return pctA - pctB;
  });

  const setoresOrdenados = [...setores].sort((a, b) => {
    const pctA = calcularConformidade(a.totalSim, a.totalNao) ?? 100;
    const pctB = calcularConformidade(b.totalSim, b.totalNao) ?? 100;
    return pctA - pctB;
  });

  const perguntasProblematicas = [...perguntas]
    .filter((p) => p.totalNao > 0)
    .sort((a, b) => b.totalNao - a.totalNao)
    .slice(0, 8);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Ionicons name="hourglass-outline" size={28} color={colors.textSecondary} />
        <Text style={styles.emptyText}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
        <Text style={[styles.emptyText, { color: colors.danger }]}>{error}</Text>
        <Button label="Tentar novamente" icon="refresh" onPress={carregar} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, isWideWeb && styles.containerWideWeb]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Visão Geral</Text>
      <View style={styles.statsGrid}>
        <StatCard
          icon="clipboard-outline"
          label="Checklists"
          valor={String(global.totalChecklists)}
          cor={colors.primary}
          wide={isWideWeb}
        />
        <StatCard
          icon="list-outline"
          label="Respostas"
          valor={String(global.totalRespostas)}
          cor={colors.primary}
          wide={isWideWeb}
        />
        <StatCard
          icon="checkmark-circle-outline"
          label="Sim"
          valor={String(global.totalSim)}
          cor={colors.success}
          wide={isWideWeb}
        />
        <StatCard
          icon="close-circle-outline"
          label="Não"
          valor={String(global.totalNao)}
          cor={colors.danger}
          wide={isWideWeb}
        />
      </View>

      <View style={[styles.conformidadeCard, shadow.card]}>
        <Text style={styles.conformidadeLabel}>CONFORMIDADE GLOBAL</Text>
        <Text
          style={[
            styles.conformidadeValor,
            { color: conformidadeGlobal !== null ? corConformidade(conformidadeGlobal) : colors.textSecondary },
          ]}
        >
          {conformidadeGlobal !== null ? `${conformidadeGlobal.toFixed(0)}%` : '—'}
        </Text>
        <BarraConformidade pct={conformidadeGlobal} />
      </View>

      <Text style={styles.sectionTitle}>Por Categoria</Text>
      {categoriasOrdenadas.length === 0 ? (
        <Text style={styles.emptyText}>Sem dados ainda.</Text>
      ) : (
        <View style={[isWideWeb && styles.gridWide]}>
          {categoriasOrdenadas.map((cat) => (
            <MetricaRow
              key={cat.categoriaNome}
              titulo={cat.categoriaNome}
              sim={cat.totalSim}
              nao={cat.totalNao}
              wide={isWideWeb}
            />
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Por Setor</Text>
      {setoresOrdenados.length === 0 ? (
        <Text style={styles.emptyText}>
          Sem dados ainda. Só entram aqui checklists enviados por alguém já associado a um
          setor — checklists mais antigos podem não ter essa informação.
        </Text>
      ) : (
        <View style={[isWideWeb && styles.gridWide]}>
          {setoresOrdenados.map((setor) => (
            <MetricaRow
              key={setor.setorId}
              titulo={setor.setorNome}
              sim={setor.totalSim}
              nao={setor.totalNao}
              wide={isWideWeb}
            />
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Perguntas com Mais Reprovação</Text>
      {perguntasProblematicas.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma reprovação registrada ainda — ótimo sinal.</Text>
      ) : (
        <View style={[isWideWeb && styles.gridWide]}>
          {perguntasProblematicas.map((pergunta) => (
            <View
              key={pergunta.perguntaId}
              style={[styles.perguntaCard, shadow.card, isWideWeb && styles.perguntaCardWide]}
            >
              <View style={styles.perguntaTextWrap}>
                <Text style={styles.perguntaCategoria}>{pergunta.categoria}</Text>
                <Text style={styles.perguntaTexto}>{pergunta.perguntaTexto}</Text>
              </View>
              <View style={styles.perguntaBadge}>
                <Ionicons name="close-circle" size={13} color={colors.danger} />
                <Text style={styles.perguntaBadgeText}>{pergunta.totalNao}x</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={styles.scrollSpacer} />
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  valor,
  cor,
  wide,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
  cor: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.statCard, shadow.card, wide && styles.statCardWide]}>
      <Ionicons name={icon} size={18} color={cor} />
      <Text style={styles.statValor}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BarraConformidade({ pct }: { pct: number | null }) {
  const largura = pct !== null ? `${Math.max(0, Math.min(100, pct))}%` : '0%';
  const cor = pct !== null ? corConformidade(pct) : colors.border;
  return (
    <View style={styles.barraTrack}>
      <View style={[styles.barraFill, { width: largura as any, backgroundColor: cor }]} />
    </View>
  );
}

function MetricaRow({
  titulo,
  sim,
  nao,
  wide,
}: {
  titulo: string;
  sim: number;
  nao: number;
  wide?: boolean;
}) {
  const pct = calcularConformidade(sim, nao);
  return (
    <View style={[styles.metricaCard, shadow.card, wide && styles.metricaCardWide]}>
      <View style={styles.metricaHeaderRow}>
        <Text style={styles.metricaTitulo} numberOfLines={1}>
          {titulo}
        </Text>
        <Text style={[styles.metricaPct, { color: pct !== null ? corConformidade(pct) : colors.textSecondary }]}>
          {pct !== null ? `${pct.toFixed(0)}%` : '—'}
        </Text>
      </View>
      <BarraConformidade pct={pct} />
      <Text style={styles.metricaContagem}>
        {sim} Sim · {nao} Não · {sim + nao} total
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  containerWideWeb: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  scrollSpacer: {
    height: spacing.xl,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statCardWide: {
    width: '23%',
  },
  statValor: {
    ...typography.title,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  conformidadeCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  conformidadeLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  conformidadeValor: {
    fontSize: 40,
    fontWeight: '800',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  barraTrack: {
    width: '100%',
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  barraFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  metricaCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  metricaCardWide: {
    width: '48.5%',
  },
  metricaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  metricaTitulo: {
    ...typography.sectionTitle,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  metricaPct: {
    fontSize: 16,
    fontWeight: '800',
  },
  metricaContagem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  perguntaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  perguntaCardWide: {
    width: '48.5%',
  },
  perguntaTextWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  perguntaCategoria: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  perguntaTexto: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: 2,
  },
  perguntaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  perguntaBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: 3,
  },
});
