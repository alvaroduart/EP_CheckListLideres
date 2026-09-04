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
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { LIDERES, TURNOS } from '../config/appConfig';
import { salvarChecklist } from '../db/checklistsRepo';
import { listCategorias } from '../db/categoriasRepo';
import { listQuestoesAtivas } from '../db/questoesRepo';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { Categoria, Questao, RespostaValor, RootStackParamList } from '../types';
import { formatDateISO } from '../utils/date';
import { generateId } from '../utils/id';

type Props = NativeStackScreenProps<RootStackParamList, 'Checklist'>;

const OUTRO = 'Outro';
const RESPONSAVEL_OPTIONS = [...LIDERES, OUTRO];

interface CategoriaGrupo {
  categoria: Categoria;
  perguntas: Questao[];
}

export default function ChecklistScreen({ navigation }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>('');
  const [responsavelCustom, setResponsavelCustom] = useState('');
  const [data, setData] = useState(new Date());
  const [turno, setTurno] = useState<string>(TURNOS[0]);
  const [observacoes, setObservacoes] = useState('');
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [fotos, setFotos] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoadError(null);
    try {
      const [cats, dados] = await Promise.all([listCategorias(), listQuestoesAtivas()]);
      setCategorias(cats);
      setQuestoes(dados);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar o checklist.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await carregarDados();
      setLoading(false);
    })();
  }, [carregarDados]);

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
  const responsavelFinal =
    responsavelSelecionado === OUTRO ? responsavelCustom.trim() : responsavelSelecionado;

  const handleChangeResposta = (perguntaId: string, valor: RespostaValor) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }));
  };

  const handleChangeFoto = (perguntaId: string, uri: string | null) => {
    setFotos((prev) => ({ ...prev, [perguntaId]: uri }));
  };

  const resetForm = () => {
    setResponsavelSelecionado('');
    setResponsavelCustom('');
    setData(new Date());
    setTurno(TURNOS[0]);
    setObservacoes('');
    setRespostas({});
    setFotos({});
  };

  const handleSalvar = async () => {
    if (!responsavelFinal) {
      Alert.alert('Campo obrigatório', 'Informe o nome do responsável.');
      return;
    }
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
        data: formatDateISO(data),
        responsavel: responsavelFinal,
        turno,
        observacoes: observacoes.trim(),
        respostas: questoes.map((q) => ({
          perguntaId: q.id,
          categoria: q.categoria,
          pergunta: q.pergunta,
          resposta: respostas[q.id],
          fotoUri: fotos[q.id] ?? null,
        })),
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

              <SelectField
                label="Responsável"
                options={RESPONSAVEL_OPTIONS}
                value={responsavelSelecionado}
                onChange={setResponsavelSelecionado}
                icon="person-outline"
                placeholder="Selecione o responsável"
              />
              {responsavelSelecionado === OUTRO && (
                <TextField
                  label="Nome do responsável"
                  placeholder="Digite o nome completo"
                  value={responsavelCustom}
                  onChangeText={setResponsavelCustom}
                  icon="create-outline"
                />
              )}

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
                  fotos={fotos}
                  onChangeFoto={handleChangeFoto}
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
