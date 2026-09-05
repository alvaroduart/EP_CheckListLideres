import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../components/Button';
import CategorySection from '../components/CategorySection';
import DatePickerField from '../components/DatePickerField';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import RadioGroup from '../components/RadioGroup';
import TextField from '../components/TextField';
import { TURNOS } from '../config/appConfig';
import { listCategorias } from '../db/categoriasRepo';
import { salvarChecklist } from '../db/checklistsRepo';
import { contarNaoLidas } from '../db/notificacoesRepo';
import { atualizarPushToken, listPessoas } from '../db/pessoasRepo';
import { listQuestoesAtivas } from '../db/questoesRepo';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { Categoria, Pessoa, Questao, RespostaDetalhe, RespostaValor, RootStackParamList } from '../types';
import { formatDateISO } from '../utils/date';
import { generateId } from '../utils/id';
import { clearPessoaCache, getPessoaCache } from '../utils/pessoaCache';
import { registrarPushToken } from '../utils/pushNotifications';

type Props = NativeStackScreenProps<RootStackParamList, 'Checklist'>;

interface CategoriaGrupo {
  categoria: Categoria;
  perguntas: Questao[];
}

const DETALHE_VAZIO: RespostaDetalhe = {
  comentario: '',
  fotoUri: null,
  atribuidoAId: null,
  atribuidoANome: null,
};

export default function ChecklistScreen({ navigation }: Props) {
  const [pessoaId, setPessoaId] = useState<string | null>(null);
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelSetor, setResponsavelSetor] = useState('');

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [data, setData] = useState(new Date());
  const [turno, setTurno] = useState<string>(TURNOS[0]);
  const [observacoes, setObservacoes] = useState('');
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [detalhes, setDetalhes] = useState<Record<string, RespostaDetalhe>>({});
  const [submitting, setSubmitting] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoadError(null);
    try {
      const pessoa = await getPessoaCache();
      if (!pessoa) {
        navigation.reset({ index: 0, routes: [{ name: 'Cadastro' }] });
        return;
      }
      setPessoaId(pessoa.id);
      setResponsavelNome(pessoa.nome);
      setResponsavelSetor(pessoa.setorNome);

      const [cats, dados, listaPessoas, contagem] = await Promise.all([
        listCategorias(),
        listQuestoesAtivas(),
        listPessoas(),
        contarNaoLidas(pessoa.id),
      ]);
      setCategorias(cats);
      setQuestoes(dados);
      setPessoas(listaPessoas);
      setNaoLidas(contagem);

      registrarPushToken()
        .then((token) => {
          if (token && token !== pessoa.pushToken) atualizarPushToken(pessoa.id, token).catch(() => {});
        })
        .catch(() => {});
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar o checklist.');
    }
  }, [navigation]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await carregarDados();
      setLoading(false);
    })();
  }, [carregarDados]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (pessoaId) {
        const contagem = await contarNaoLidas(pessoaId).catch(() => 0);
        setNaoLidas(contagem);
      }
    });
    return unsubscribe;
  }, [navigation, pessoaId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  }, [carregarDados]);

  const grupos: CategoriaGrupo[] = useMemo(() => {
    return categorias
      .map((categoria) => ({
        categoria,
        perguntas: questoes
          .filter((q) => q.categoriaId === categoria.id)
          .sort((a, b) => a.ordem - b.ordem),
      }))
      .filter((grupo) => grupo.perguntas.length > 0);
  }, [categorias, questoes]);

  const totalPerguntas = questoes.length;
  const totalRespondidas = Object.keys(respostas).length;

  const handleChangeResposta = (perguntaId: string, valor: RespostaValor) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }));
    if (valor === 'Sim') {
      setDetalhes((prev) => {
        if (!prev[perguntaId]) return prev;
        const { [perguntaId]: _removido, ...resto } = prev;
        return resto;
      });
    }
  };

  const handleChangeDetalhe = (perguntaId: string, patch: Partial<RespostaDetalhe>) => {
    setDetalhes((prev) => ({
      ...prev,
      [perguntaId]: { ...(prev[perguntaId] ?? DETALHE_VAZIO), ...patch },
    }));
  };

  const resetForm = () => {
    setData(new Date());
    setTurno(TURNOS[0]);
    setObservacoes('');
    setRespostas({});
    setDetalhes({});
  };

  const handleTrocarUsuario = () => {
    Alert.alert('Trocar usuário', 'Deseja sair e fazer um novo cadastro neste aparelho?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await clearPessoaCache();
          navigation.reset({ index: 0, routes: [{ name: 'Cadastro' }] });
        },
      },
    ]);
  };

  const handleSalvar = async () => {
    if (!pessoaId) return;
    const faltando = questoes.filter((q) => !respostas[q.id]);
    if (faltando.length > 0) {
      Alert.alert(
        'Checklist incompleto',
        `Ainda faltam ${faltando.length} pergunta(s) para responder.`
      );
      return;
    }

    setSubmitting(true);
    try {
      await salvarChecklist({
        checklistId: generateId('CL'),
        responsavelId: pessoaId,
        data: formatDateISO(data),
        responsavel: responsavelNome,
        turno,
        observacoes: observacoes.trim(),
        respostas: questoes.map((q) => {
          const detalhe = detalhes[q.id] ?? DETALHE_VAZIO;
          return {
            perguntaId: q.id,
            categoria: q.categoria,
            pergunta: q.pergunta,
            resposta: respostas[q.id],
            fotoUri: detalhe.fotoUri,
            comentario: detalhe.comentario.trim() || null,
            atribuidoAId: detalhe.atribuidoAId,
            atribuidoANome: detalhe.atribuidoANome,
          };
        }),
      });
      Alert.alert('Sucesso', 'Checklist salvo com sucesso!');
      resetForm();
    } catch (err) {
      Alert.alert(
        'Erro ao salvar',
        err instanceof Error ? err.message : 'Não foi possível salvar o checklist.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
    >
      <Header
        title="Checklist Diário"
        subtitle="Liderança de Produção"
        onNotificationsPress={() => navigation.navigate('Notificacoes')}
        unreadCount={naoLidas}
        onSettingsPress={() => navigation.navigate('AdminLogin')}
      />

      {loading ? (
        <View style={styles.centered}>
          <Ionicons name="hourglass-outline" size={28} color={colors.textSecondary} />
          <Text style={styles.infoText}>Carregando checklist...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
          <Text style={styles.errorText}>{loadError}</Text>
          <Button label="Tentar novamente" icon="refresh" onPress={carregarDados} style={styles.retryButton} />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.identCard, shadow.card]}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>Identificação</Text>
              </View>

              <View style={styles.responsavelRow}>
                <View style={styles.responsavelInfo}>
                  <Text style={styles.responsavelLabel}>RESPONSÁVEL</Text>
                  <Text style={styles.responsavelNome}>{responsavelNome}</Text>
                  <Text style={styles.responsavelSetor}>{responsavelSetor}</Text>
                </View>
                <Button label="Trocar" variant="text" onPress={handleTrocarUsuario} style={styles.trocarButton} />
              </View>

              <DatePickerField label="Data" value={data} onChange={setData} />
              <RadioGroup label="Turno" options={TURNOS} value={turno} onChange={setTurno} icon="time-outline" />
            </View>

            <ProgressBar respondidas={totalRespondidas} total={totalPerguntas} />

            {grupos.length === 0 ? (
              <View style={styles.centered}>
                <Ionicons name="file-tray-outline" size={28} color={colors.textSecondary} />
                <Text style={styles.infoText}>Nenhuma pergunta configurada.</Text>
              </View>
            ) : (
              grupos.map((grupo) => (
                <CategorySection
                  key={grupo.categoria.id}
                  categoria={grupo.categoria}
                  perguntas={grupo.perguntas}
                  respostas={respostas}
                  onChangeResposta={handleChangeResposta}
                  detalhes={detalhes}
                  onChangeDetalhe={handleChangeDetalhe}
                  pessoas={pessoas.filter((p) => p.id !== pessoaId)}
                />
              ))
            )}

            <View style={[styles.identCard, shadow.card, styles.obsCard]}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="chatbox-ellipses-outline" size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>Observações Gerais</Text>
              </View>
              <TextField
                label="Opcional"
                placeholder="Registre observações relevantes..."
                value={observacoes}
                onChangeText={setObservacoes}
                multiline
                numberOfLines={4}
                style={styles.textarea}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerProgress}>
              {totalRespondidas}/{totalPerguntas} itens respondidos
            </Text>
            <Button
              label="Salvar Checklist"
              icon="checkmark-done-outline"
              onPress={handleSalvar}
              loading={submitting}
              style={styles.saveButton}
            />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.backgroundAlt },
  scrollContent: {
    paddingBottom: spacing.xxl * 4,
  },
  identCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  obsCard: {
    marginTop: spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  responsavelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  responsavelInfo: {
    flex: 1,
  },
  responsavelLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  responsavelNome: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  responsavelSetor: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  trocarButton: {
    paddingVertical: spacing.xs,
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
  retryButton: {
    minWidth: 180,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  footerProgress: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  saveButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
});
