import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import TextField from '../components/TextField';
import { atualizarCategoria, criarCategoria } from '../db/categoriasRepo';
import { CATEGORY_ICON_CHOICES, colors, radius, shadow, spacing, typography } from '../theme/theme';
import { CategoriaIcone, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminCategoryForm'>;

export default function AdminCategoryFormScreen({ navigation, route }: Props) {
  const categoriaExistente = route.params?.categoria;
  const isEdicao = !!categoriaExistente;

  const [nome, setNome] = useState(categoriaExistente?.nome ?? '');
  const [icone, setIcone] = useState<CategoriaIcone>(categoriaExistente?.icone ?? CATEGORY_ICON_CHOICES[0]);
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome da categoria.');
      return;
    }
    setSalvando(true);
    try {
      if (isEdicao) {
        await atualizarCategoria(categoriaExistente!.id, nome.trim(), icone);
      } else {
        await criarCategoria(nome.trim(), icone);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro ao salvar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
    >
      <Header
        title={isEdicao ? 'Editar Categoria' : 'Nova Categoria'}
        subtitle="Configurações do Checklist"
        badge="ADMIN"
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, shadow.card]}>
          <TextField
            label="Nome da Categoria"
            placeholder="Ex: Qualidade, Meio Ambiente..."
            value={nome}
            onChangeText={setNome}
            icon="pricetag-outline"
          />

          <Text style={styles.label}>ÍCONE</Text>
          <View style={styles.iconGrid}>
            {CATEGORY_ICON_CHOICES.map((opcao) => {
              const selected = opcao === icone;
              return (
                <Pressable
                  key={opcao}
                  onPress={() => setIcone(opcao)}
                  style={({ pressed }) => [
                    styles.iconOption,
                    selected && styles.iconOptionSelected,
                    pressed && styles.iconOptionPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={opcao}
                    size={22}
                    color={selected ? colors.textInverse : colors.primary}
                  />
                </Pressable>
              );
            })}
          </View>

          <Button
            label={isEdicao ? 'Salvar Alterações' : 'Criar Categoria'}
            icon={isEdicao ? 'save-outline' : 'add-circle-outline'}
            onPress={handleSalvar}
            loading={salvando}
            style={styles.saveButton}
          />
          <Button label="Cancelar" onPress={() => navigation.goBack()} variant="text" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 4,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  iconOption: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundAlt,
  },
  iconOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  iconOptionPressed: {
    opacity: 0.75,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
