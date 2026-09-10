import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { excluirSetor } from '../db/setoresRepo';
import { useIsWideWeb } from '../hooks/useResponsive';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { RootStackParamList, Setor } from '../types';
import Button from './Button';

interface AdminSetoresTabProps {
  setores: Setor[];
  pessoasPorSetor: Record<string, number>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Admin'>;
  onChanged: () => void;
}

export default function AdminSetoresTab({
  setores,
  pessoasPorSetor,
  navigation,
  onChanged,
}: AdminSetoresTabProps) {
  const isWideWeb = useIsWideWeb();
  const handleExcluir = (setor: Setor) => {
    Alert.alert('Excluir setor', `Tem certeza que deseja excluir "${setor.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirSetor(setor.id);
            onChanged();
          } catch (err) {
            Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível excluir.');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, isWideWeb && styles.containerWideWeb]}>
      <Button
        label="+ Novo Setor"
        onPress={() => navigation.navigate('AdminSetorForm')}
        style={styles.newButton}
      />

      {setores.length === 0 && (
        <Text style={styles.emptyText}>Nenhum setor cadastrado ainda.</Text>
      )}

      <View style={[isWideWeb && styles.gridWide]}>
        {setores.map((setor) => (
          <View key={setor.id} style={[styles.card, shadow.card, isWideWeb && styles.cardWide]}>
            <View style={styles.iconBadge}>
              <Ionicons name="business-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.nome}>{setor.nome}</Text>
              <Text style={styles.count}>{pessoasPorSetor[setor.id] ?? 0} pessoa(s)</Text>
            </View>
            <Pressable
              style={styles.actionButton}
              onPress={() => navigation.navigate('AdminSetorForm', { setor })}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => handleExcluir(setor)}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  containerWideWeb: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  newButton: {
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardWide: {
    width: '48.5%',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  nome: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  count: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
});
