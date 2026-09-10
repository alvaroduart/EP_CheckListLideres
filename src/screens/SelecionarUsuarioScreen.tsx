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
import { atualizarPushToken, listPessoas } from '../db/pessoasRepo';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { Pessoa, RootStackParamList } from '../types';
import { setPessoaCache } from '../utils/pessoaCache';
import { registrarPushToken } from '../utils/pushNotifications';

type Props = NativeStackScreenProps<RootStackParamList, 'SelecionarUsuario'>;

export default function SelecionarUsuarioScreen({ navigation }: Props) {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selecionandoId, setSelecionandoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const dados = await listPessoas();
      setPessoas(dados);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar as pessoas.');
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

  const handleSelecionar = async (pessoa: Pessoa) => {
    setSelecionandoId(pessoa.id);
    try {
      await setPessoaCache(pessoa);

      registrarPushToken()
        .then((token) => {
          if (token) atualizarPushToken(pessoa.id, token).catch(() => {});
        })
        .catch(() => {});

      navigation.reset({ index: 0, routes: [{ name: 'Checklist' }] });
    } finally {
      setSelecionandoId(null);
    }
  };

  return (
    <View style={styles.flex}>
      <Header title="Bem-vindo(a)" subtitle="Quem é você?" />

      {loading ? (
        <View style={styles.centered}>
          <Ionicons name="hourglass-outline" size={28} color={colors.textSecondary} />
          <Text style={styles.infoText}>Carregando...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
          <Text style={styles.errorText}>{erro}</Text>
          <Button label="Tentar novamente" icon="refresh" onPress={carregar} style={styles.retryButton} />
        </View>
      ) : pessoas.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Nenhum usuário cadastrado ainda. Peça para o administrador cadastrar você na área de
            administração (aba Pessoas).
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.description}>Selecione seu nome na lista abaixo para continuar.</Text>
          {pessoas.map((pessoa) => (
            <Pressable
              key={pessoa.id}
              onPress={() => handleSelecionar(pessoa)}
              disabled={!!selecionandoId}
              style={({ pressed }) => [
                styles.card,
                shadow.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardNome}>{pessoa.nome}</Text>
                <Text style={styles.cardSetor}>{pessoa.setorNome}</Text>
              </View>
              {selecionandoId === pessoa.id ? (
                <Ionicons name="hourglass-outline" size={18} color={colors.textSecondary} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
  retryButton: {
    minWidth: 180,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardPressed: {
    opacity: 0.75,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardText: {
    flex: 1,
  },
  cardNome: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  cardSetor: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
