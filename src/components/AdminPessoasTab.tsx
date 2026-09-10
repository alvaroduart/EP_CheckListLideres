import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { excluirPessoa } from '../db/pessoasRepo';
import { useIsWideWeb } from '../hooks/useResponsive';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { Pessoa, RootStackParamList } from '../types';
import Button from './Button';

interface AdminPessoasTabProps {
  pessoas: Pessoa[];
  navigation: NativeStackNavigationProp<RootStackParamList, 'Admin'>;
  onChanged: () => void;
}

export default function AdminPessoasTab({ pessoas, navigation, onChanged }: AdminPessoasTabProps) {
  const isWideWeb = useIsWideWeb();
  const handleExcluir = (pessoa: Pessoa) => {
    Alert.alert('Excluir pessoa', `Tem certeza que deseja excluir "${pessoa.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirPessoa(pessoa.id);
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
        label="+ Nova Pessoa"
        onPress={() => navigation.navigate('AdminPessoaForm')}
        style={styles.newButton}
      />

      {pessoas.length === 0 && (
        <Text style={styles.emptyText}>Nenhuma pessoa cadastrada ainda.</Text>
      )}

      <View style={[isWideWeb && styles.gridWide]}>
        {pessoas.map((pessoa) => (
          <View key={pessoa.id} style={[styles.card, shadow.card, isWideWeb && styles.cardWide]}>
            <View style={styles.iconBadge}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.nome}>{pessoa.nome}</Text>
              <Text style={styles.count}>{pessoa.setorNome}</Text>
            </View>
            <Pressable
              style={styles.actionButton}
              onPress={() => navigation.navigate('AdminPessoaForm', { pessoa })}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => handleExcluir(pessoa)}>
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
