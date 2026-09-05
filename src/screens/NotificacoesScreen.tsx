import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import {
  contarNaoLidas,
  listNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
} from '../db/notificacoesRepo';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { Notificacao, RootStackParamList } from '../types';
import { getPessoaCache } from '../utils/pessoaCache';

type Props = NativeStackScreenProps<RootStackParamList, 'Notificacoes'>;

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function NotificacoesScreen({ navigation }: Props) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pessoaId, setPessoaId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const pessoa = await getPessoaCache();
      if (!pessoa) return;
      setPessoaId(pessoa.id);
      const dados = await listNotificacoes(pessoa.id);
      setNotificacoes(dados);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar notificações.');
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

  const handleTocar = async (notificacao: Notificacao) => {
    if (notificacao.lida) return;
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === notificacao.id ? { ...n, lida: true } : n))
    );
    try {
      await marcarComoLida(notificacao.id);
    } catch {
      // ignore
    }
  };

  const handleMarcarTodas = async () => {
    if (!pessoaId) return;
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    try {
      await marcarTodasComoLidas(pessoaId);
    } catch {
      // ignore
    }
  };

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <View style={styles.flex}>
      <Header title="Notificações" subtitle={pessoaId ? `${naoLidas} não lida(s)` : undefined} />
      <View style={styles.toolbar}>
        <Button label="Voltar" variant="text" icon="arrow-back-outline" onPress={() => navigation.goBack()} />
        {naoLidas > 0 && (
          <Button label="Marcar todas como lidas" variant="text" onPress={handleMarcarTodas} />
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Ionicons name="hourglass-outline" size={28} color={colors.textSecondary} />
          <Text style={styles.infoText}>Carregando notificações...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
          <Text style={styles.errorText}>{erro}</Text>
          <Button label="Tentar novamente" icon="refresh" onPress={carregar} />
        </View>
      ) : notificacoes.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="notifications-off-outline" size={28} color={colors.textSecondary} />
          <Text style={styles.infoText}>Nenhuma notificação por aqui ainda.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {notificacoes.map((notificacao) => (
            <Pressable
              key={notificacao.id}
              onPress={() => handleTocar(notificacao)}
              style={({ pressed }) => [
                styles.card,
                shadow.card,
                !notificacao.lida && styles.cardNaoLida,
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor:
                      notificacao.tipo === 'tarefa' ? colors.dangerBg : colors.successBg,
                  },
                ]}
              >
                <Ionicons
                  name={notificacao.tipo === 'tarefa' ? 'alert-circle-outline' : 'checkmark-done-outline'}
                  size={18}
                  color={notificacao.tipo === 'tarefa' ? colors.danger : colors.success}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitulo}>{notificacao.titulo}</Text>
                <Text style={styles.cardMensagem}>{notificacao.mensagem}</Text>
                <Text style={styles.cardData}>{formatarDataHora(notificacao.criadoEm)}</Text>
              </View>
              {!notificacao.lida && <View style={styles.dotNaoLida} />}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.backgroundAlt },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
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
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardNaoLida: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  cardPressed: {
    opacity: 0.75,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  cardText: {
    flex: 1,
  },
  cardTitulo: {
    ...typography.sectionTitle,
    fontSize: 14,
    color: colors.textPrimary,
  },
  cardMensagem: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardData: {
    fontSize: 11,
    color: colors.placeholder,
    marginTop: spacing.xs,
  },
  dotNaoLida: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
    marginTop: 4,
  },
});
