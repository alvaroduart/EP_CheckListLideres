import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { excluirCategoria } from '../db/categoriasRepo';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { Categoria, RootStackParamList } from '../types';
import Button from './Button';

interface AdminCategoriasTabProps {
  categorias: Categoria[];
  perguntasPorCategoria: Record<string, number>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Admin'>;
  onChanged: () => void;
}

export default function AdminCategoriasTab({
  categorias,
  perguntasPorCategoria,
  navigation,
  onChanged,
}: AdminCategoriasTabProps) {
  const handleExcluir = (categoria: Categoria) => {
    Alert.alert('Excluir categoria', `Tem certeza que deseja excluir "${categoria.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirCategoria(categoria.id);
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
      <Button
        label="+ Nova Categoria"
        onPress={() => navigation.navigate('AdminCategoryForm')}
        style={styles.newButton}
      />

      {categorias.length === 0 && (
        <Text style={styles.emptyText}>Nenhuma categoria cadastrada ainda.</Text>
      )}

      {categorias.map((categoria) => (
        <View key={categoria.id} style={[styles.card, shadow.card]}>
          <View style={[styles.iconBadge, { backgroundColor: categoria.corFundo }]}>
            <MaterialCommunityIcons name={categoria.icone} size={20} color={categoria.cor} />
          </View>
          <View style={styles.info}>
            <Text style={styles.nome}>{categoria.nome}</Text>
            <Text style={styles.count}>
              {perguntasPorCategoria[categoria.id] ?? 0} pergunta(s)
            </Text>
          </View>
          <Pressable
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdminCategoryForm', { categoria })}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => handleExcluir(categoria)}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
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
