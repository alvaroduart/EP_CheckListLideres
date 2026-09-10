import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../components/Button';
import DatePickerField from '../components/DatePickerField';
import Header from '../components/Header';
import { atualizarTarefa, getTarefa, STATUS_LABEL } from '../db/tarefasRepo';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { RootStackParamList, Tarefa, TarefaStatus } from '../types';
import { formatDateISO, parseDateISO } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'TarefaDetalhe'>;

const STATUS_OPCOES: TarefaStatus[] = ['pendente', 'em_andamento', 'concluida'];

export default function TarefaDetalheScreen({ navigation, route }: Props) {
  const { tarefaId } = route.params;
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [status, setStatus] = useState<TarefaStatus>('pendente');
  const [dataPrevista, setDataPrevista] = useState<Date>(new Date());
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErro(null);
      try {
        const dados = await getTarefa(tarefaId);
        setTarefa(dados);
        setStatus(dados.status);
        setDataPrevista(dados.dataConclusaoPrevista ? parseDateISO(dados.dataConclusaoPrevista) : new Date());
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar a tarefa.');
      } finally {
        setLoading(false);
      }
    })();
  }, [tarefaId]);

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await atualizarTarefa(tarefaId, {
        status,
        dataConclusaoPrevista: formatDateISO(dataPrevista),
      });
      Alert.alert('Tarefa atualizada', `${tarefa?.atribuidoPorNome} foi notificado(a) da atualização.`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro ao salvar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.flex}>
      <Header title="Tarefa Atribuída" subtitle="Detalhe e andamento" />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : erro || !tarefa ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
          <Text style={styles.errorText}>{erro ?? 'Tarefa não encontrada.'}</Text>
          <Button label="Voltar" variant="text" onPress={() => navigation.goBack()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, shadow.card]}>
            {tarefa.categoria ? <Text style={styles.categoria}>{tarefa.categoria}</Text> : null}
            <Text style={styles.pergunta}>{tarefa.perguntaTexto}</Text>

            {tarefa.comentario ? (
              <View style={styles.comentarioBox}>
                <Ionicons name="chatbox-ellipses-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.comentarioText}>{tarefa.comentario}</Text>
              </View>
            ) : null}

            {tarefa.fotoUri ? (
              <Image source={{ uri: tarefa.fotoUri }} style={styles.foto} resizeMode="cover" />
            ) : null}

            <View style={styles.atribuidoRow}>
              <Ionicons name="person-outline" size={14} color={colors.primary} />
              <Text style={styles.atribuidoText}>Atribuída por {tarefa.atribuidoPorNome}</Text>
            </View>
          </View>

          <View style={[styles.card, shadow.card, styles.formCard]}>
            <Text style={styles.sectionTitle}>Andamento</Text>

            <Text style={styles.label}>STATUS</Text>
            <View style={styles.statusRow}>
              {STATUS_OPCOES.map((opcao) => {
                const selected = status === opcao;
                return (
                  <Pressable
                    key={opcao}
                    onPress={() => setStatus(opcao)}
                    style={({ pressed }) => [
                      styles.statusOption,
                      selected && styles.statusOptionSelected,
                      pressed && styles.statusOptionPressed,
                    ]}
                  >
                    <Text style={[styles.statusOptionText, selected && styles.statusOptionTextSelected]}>
                      {STATUS_LABEL[opcao]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <DatePickerField
              label="Previsão de conclusão"
              value={dataPrevista}
              onChange={setDataPrevista}
            />

            <Button
              label="Salvar Andamento"
              icon="checkmark-done-outline"
              onPress={handleSalvar}
              loading={salvando}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.backgroundAlt },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  formCard: {
    marginTop: spacing.lg,
  },
  categoria: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  pergunta: {
    ...typography.title,
    fontSize: 17,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  comentarioBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  comentarioText: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginLeft: spacing.xs,
    flex: 1,
  },
  foto: {
    width: '100%',
    height: 180,
    borderRadius: radius.sm,
    marginTop: spacing.md,
  },
  atribuidoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  atribuidoText: {
    ...typography.label,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  statusOption: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  statusOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusOptionPressed: {
    opacity: 0.8,
  },
  statusOptionText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusOptionTextSelected: {
    color: colors.textInverse,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
