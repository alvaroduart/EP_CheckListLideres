import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { excluirChecklist, getChecklistDetalhe, listChecklists } from '../db/checklistsRepo';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { ChecklistDetalhe, ChecklistRegistro } from '../types';
import { excluirFoto } from '../utils/photos';

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function AdminHistoricoTab() {
  const [registros, setRegistros] = useState<ChecklistRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<ChecklistDetalhe | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setError(null);
    try {
      const dados = await listChecklists();
      setRegistros(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar o histórico.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await carregar();
      setLoading(false);
    })();
  }, [carregar]);

  const handleExpandir = async (registro: ChecklistRegistro) => {
    if (expandidoId === registro.id) {
      setExpandidoId(null);
      setDetalhe(null);
      return;
    }
    setExpandidoId(registro.id);
    setCarregandoDetalhe(true);
    try {
      const det = await getChecklistDetalhe(registro.id);
      setDetalhe(det);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível carregar o checklist.');
      setExpandidoId(null);
    } finally {
      setCarregandoDetalhe(false);
    }
  };

  const handleExcluir = (registro: ChecklistRegistro) => {
    Alert.alert(
      'Excluir checklist',
      `Excluir o checklist de ${registro.responsavel} em ${registro.data}? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              if (expandidoId === registro.id && detalhe) {
                detalhe.respostas.forEach((r) => {
                  if (r.fotoUri) excluirFoto(r.fotoUri);
                });
              }
              await excluirChecklist(registro.id);
              setExpandidoId(null);
              setDetalhe(null);
              await carregar();
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível excluir.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Ionicons name="hourglass-outline" size={28} color={colors.textSecondary} />
        <Text style={styles.infoText}>Carregando histórico...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} />}
    >
      {registros.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="time-outline" size={28} color={colors.textSecondary} />
          <Text style={styles.infoText}>Nenhum checklist enviado ainda.</Text>
        </View>
      ) : (
        registros.map((registro) => {
          const expandido = expandidoId === registro.id;
          return (
            <View key={registro.id} style={[styles.card, shadow.card]}>
              <Pressable style={styles.cardHeader} onPress={() => handleExpandir(registro)}>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.responsavel}>{registro.responsavel}</Text>
                  <Text style={styles.meta}>
                    {registro.data} · {registro.turno} · {formatarDataHora(registro.criadoEm)}
                  </Text>
                </View>
                <Ionicons
                  name={expandido ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>

              <View style={styles.badgesRow}>
                <Badge icon="checkmark-circle" color={colors.success} label={`${registro.totalSim} Sim`} />
                <Badge icon="close-circle" color={colors.danger} label={`${registro.totalNao} Não`} />
                {registro.totalFotos > 0 && (
                  <Badge icon="camera" color={colors.primary} label={`${registro.totalFotos} foto(s)`} />
                )}
              </View>

              {expandido && (
                <View style={styles.detalhe}>
                  {carregandoDetalhe ? (
                    <ActivityIndicator color={colors.primary} style={styles.detalheLoading} />
                  ) : (
                    <>
                      {detalhe?.observacoes ? (
                        <Text style={styles.observacoes}>Obs: {detalhe.observacoes}</Text>
                      ) : null}
                      {detalhe?.respostas.map((r, idx) => (
                        <View key={idx} style={styles.respostaRow}>
                          <View style={styles.respostaTopRow}>
                            <View style={styles.respostaTextWrap}>
                              <Text style={styles.respostaCategoria}>{r.categoria}</Text>
                              <Text style={styles.respostaPergunta}>{r.pergunta}</Text>
                            </View>
                            <View style={styles.respostaRight}>
                              {r.fotoUri ? (
                                <Pressable onPress={() => setFotoPreview(r.fotoUri!)}>
                                  <Image source={{ uri: r.fotoUri }} style={styles.respostaThumb} />
                                </Pressable>
                              ) : null}
                              <Ionicons
                                name={r.resposta === 'Sim' ? 'checkmark-circle' : 'close-circle'}
                                size={18}
                                color={r.resposta === 'Sim' ? colors.success : colors.danger}
                              />
                            </View>
                          </View>
                          {(r.comentario || r.atribuidoANome) && (
                            <View style={styles.respostaDetalheBox}>
                              {r.comentario ? (
                                <Text style={styles.respostaComentario}>"{r.comentario}"</Text>
                              ) : null}
                              {r.atribuidoANome ? (
                                <View style={styles.respostaAtribuidoRow}>
                                  <Ionicons name="person-outline" size={12} color={colors.primary} />
                                  <Text style={styles.respostaAtribuido}>
                                    Atribuído a {r.atribuidoANome}
                                  </Text>
                                </View>
                              ) : null}
                            </View>
                          )}
                        </View>
                      ))}
                      <Pressable style={styles.deleteButton} onPress={() => handleExcluir(registro)}>
                        <Ionicons name="trash-outline" size={14} color={colors.danger} />
                        <Text style={styles.deleteButtonText}>Excluir checklist</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}

      <Modal visible={!!fotoPreview} transparent animationType="fade" onRequestClose={() => setFotoPreview(null)}>
        <Pressable style={styles.previewOverlay} onPress={() => setFotoPreview(null)}>
          {fotoPreview ? (
            <Image source={{ uri: fotoPreview }} style={styles.previewImage} resizeMode="contain" />
          ) : null}
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function Badge({ icon, color, label }: { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }) {
  return (
    <View style={styles.badge}>
      <Ionicons name={icon} size={13} color={color} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderText: {
    flex: 1,
  },
  responsavel: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  badgeIcon: {
    marginRight: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detalhe: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  detalheLoading: {
    paddingVertical: spacing.md,
  },
  observacoes: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  respostaRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  respostaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  respostaDetalheBox: {
    marginTop: spacing.xs,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  respostaComentario: {
    fontSize: 12,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  respostaAtribuidoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  respostaAtribuido: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
  },
  respostaTextWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  respostaCategoria: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  respostaPergunta: {
    ...typography.body,
    color: colors.textPrimary,
  },
  respostaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  respostaThumb: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
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
