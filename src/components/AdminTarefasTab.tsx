import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { excluirTarefa, STATUS_LABEL } from '../db/tarefasRepo';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { Tarefa, TarefaStatus } from '../types';

const STATUS_COLOR: Record<TarefaStatus, { cor: string; corFundo: string; icone: keyof typeof Ionicons.glyphMap }> = {
  pendente: { cor: colors.warning, corFundo: colors.warningBg, icone: 'time-outline' },
  em_andamento: { cor: colors.primary, corFundo: colors.card, icone: 'sync-outline' },
  concluida: { cor: colors.success, corFundo: colors.successBg, icone: 'checkmark-circle-outline' },
};

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

interface AdminTarefasTabProps {
  tarefas: Tarefa[];
  onChanged: () => void;
}

export default function AdminTarefasTab({ tarefas, onChanged }: AdminTarefasTabProps) {
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const abertas = tarefas.filter((t) => t.status !== 'concluida');
  const concluidas = tarefas.filter((t) => t.status === 'concluida');
  const ordenadas = [...abertas, ...concluidas];

  const handleExcluir = (tarefa: Tarefa) => {
    Alert.alert('Excluir tarefa', `Excluir a tarefa "${tarefa.perguntaTexto ?? ''}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirTarefa(tarefa.id);
            onChanged();
          } catch (err) {
            Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível excluir.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.summary}>
        {abertas.length} tarefa(s) em aberto · {concluidas.length} concluída(s)
      </Text>

      {tarefas.length === 0 && (
        <Text style={styles.emptyText}>Nenhuma tarefa atribuída ainda.</Text>
      )}

      {ordenadas.map((tarefa) => {
        const statusStyle = STATUS_COLOR[tarefa.status];
        return (
          <View key={tarefa.id} style={[styles.card, shadow.card, { borderLeftColor: statusStyle.cor }]}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                {tarefa.categoria ? <Text style={styles.categoria}>{tarefa.categoria}</Text> : null}
                <Text style={styles.pergunta}>{tarefa.perguntaTexto ?? '—'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.corFundo }]}>
                <Ionicons name={statusStyle.icone} size={12} color={statusStyle.cor} />
                <Text style={[styles.statusText, { color: statusStyle.cor }]}>
                  {STATUS_LABEL[tarefa.status]}
                </Text>
              </View>
            </View>

            {tarefa.comentario ? <Text style={styles.comentario}>"{tarefa.comentario}"</Text> : null}

            {tarefa.fotoUri ? (
              <Pressable onPress={() => setFotoPreview(tarefa.fotoUri)}>
                <Image source={{ uri: tarefa.fotoUri }} style={styles.thumb} />
              </Pressable>
            ) : null}

            <View style={styles.metaRow}>
              <Ionicons name="arrow-redo-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                {tarefa.atribuidoPorNome} → {tarefa.atribuidoANome}
              </Text>
            </View>
            {tarefa.dataConclusaoPrevista ? (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>Previsão: {formatarData(tarefa.dataConclusaoPrevista)}</Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metaText}>Criada em {formatarData(tarefa.criadoEm)}</Text>
            </View>

            <Pressable style={styles.deleteButton} onPress={() => handleExcluir(tarefa)}>
              <Ionicons name="trash-outline" size={14} color={colors.danger} />
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </Pressable>
          </View>
        );
      })}

      <Modal visible={!!fotoPreview} transparent animationType="fade" onRequestClose={() => setFotoPreview(null)}>
        <Pressable style={styles.previewOverlay} onPress={() => setFotoPreview(null)}>
          {fotoPreview ? (
            <Image source={{ uri: fotoPreview }} style={styles.previewImage} resizeMode="contain" />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  summary: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  categoria: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  pergunta: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  comentario: {
    fontSize: 13,
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: 4,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
});
