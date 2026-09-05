import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { listSetores } from '../db/setoresRepo';
import { criarPessoa, atualizarPushToken } from '../db/pessoasRepo';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { RootStackParamList, Setor } from '../types';
import { setPessoaCache } from '../utils/pessoaCache';
import { registrarPushToken } from '../utils/pushNotifications';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export default function CadastroScreen({ navigation }: Props) {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loadingSetores, setLoadingSetores] = useState(true);
  const [erroSetores, setErroSetores] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [setorId, setSetorId] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregarSetores = async () => {
    setErroSetores(null);
    setLoadingSetores(true);
    try {
      const dados = await listSetores();
      setSetores(dados);
    } catch (err) {
      setErroSetores(err instanceof Error ? err.message : 'Erro ao carregar os setores.');
    } finally {
      setLoadingSetores(false);
    }
  };

  useEffect(() => {
    carregarSetores();
  }, []);

  const setorNomeSelecionado = setores.find((s) => s.id === setorId)?.nome ?? '';

  const handleCadastrar = async () => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatório', 'Informe seu nome.');
      return;
    }
    if (!setorId) {
      Alert.alert('Campo obrigatório', 'Selecione seu setor.');
      return;
    }

    setSalvando(true);
    try {
      const pessoa = await criarPessoa(nome, setorId);
      await setPessoaCache(pessoa);

      registrarPushToken()
        .then((token) => {
          if (token) atualizarPushToken(pessoa.id, token).catch(() => {});
        })
        .catch(() => {});

      navigation.reset({ index: 0, routes: [{ name: 'Checklist' }] });
    } catch (err) {
      Alert.alert('Erro ao cadastrar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <Header title="Bem-vindo(a)" subtitle="Cadastro do Líder" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, shadow.card]}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.title}>Faça seu cadastro</Text>
          <Text style={styles.description}>
            Informe seu nome e setor para começar a usar o checklist neste aparelho. Você não
            precisará repetir isso da próxima vez.
          </Text>

          <TextField
            label="Nome"
            placeholder="Seu nome completo"
            value={nome}
            onChangeText={setNome}
            icon="person-outline"
          />

          {loadingSetores ? (
            <Text style={styles.hint}>Carregando setores...</Text>
          ) : erroSetores ? (
            <>
              <Text style={styles.errorText}>{erroSetores}</Text>
              <Button label="Tentar novamente" icon="refresh" onPress={carregarSetores} style={styles.retryButton} />
            </>
          ) : (
            <>
              <SelectField
                label="Setor"
                options={setores.map((s) => s.nome)}
                value={setorNomeSelecionado}
                onChange={(nomeSel) => {
                  const setor = setores.find((s) => s.nome === nomeSel);
                  setSetorId(setor?.id ?? '');
                }}
                icon="business-outline"
                placeholder="Selecione o setor"
              />
              {setores.length === 0 && (
                <Text style={styles.hint}>
                  Nenhum setor cadastrado ainda. Peça para o administrador cadastrar os setores.
                </Text>
              )}
            </>
          )}

          <Button
            label="Cadastrar"
            icon="checkmark-circle-outline"
            onPress={handleCadastrar}
            loading={salvando}
            disabled={loadingSetores || setores.length === 0}
            style={styles.enterButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    paddingBottom: spacing.xxl * 4,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'stretch',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  retryButton: {
    marginBottom: spacing.md,
  },
  enterButton: {
    marginTop: spacing.sm,
  },
});
