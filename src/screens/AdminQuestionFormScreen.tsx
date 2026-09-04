import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { listCategorias } from '../db/categoriasRepo';
import { atualizarQuestao, criarQuestao } from '../db/questoesRepo';
import { colors, radius, shadow, spacing } from '../theme/theme';
import { Categoria, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminQuestionForm'>;

export default function AdminQuestionFormScreen({ navigation, route }: Props) {
  const questaoExistente = route.params?.questao;
  const isEdicao = !!questaoExistente;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState(questaoExistente?.categoriaId ?? '');
  const [pergunta, setPergunta] = useState(questaoExistente?.pergunta ?? '');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      listCategorias()
        .then(setCategorias)
        .catch(() => {});
    });
    return unsubscribe;
  }, [navigation]);

  const categoriaNomeSelecionado = categorias.find((c) => c.id === categoriaId)?.nome ?? '';
  const opcoesCategoria = categorias.map((c) => c.nome);

  const handleSelecionarCategoria = (nome: string) => {
    const categoria = categorias.find((c) => c.nome === nome);
    if (categoria) setCategoriaId(categoria.id);
  };

  const handleSalvar = async () => {
    if (!categoriaId) {
      Alert.alert('Campo obrigatório', 'Selecione a categoria da pergunta.');
      return;
    }
    if (!pergunta.trim()) {
      Alert.alert('Campo obrigatório', 'Preencha o texto da pergunta.');
      return;
    }
    setSalvando(true);
    try {
      if (isEdicao) {
        await atualizarQuestao(questaoExistente!.id, categoriaId, pergunta.trim());
      } else {
        await criarQuestao(categoriaId, pergunta.trim());
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
        title={isEdicao ? 'Editar Pergunta' : 'Nova Pergunta'}
        subtitle="Configurações do Checklist"
        badge="ADMIN"
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, shadow.card]}>
          <SelectField
            label="Categoria"
            options={opcoesCategoria}
            value={categoriaNomeSelecionado}
            onChange={handleSelecionarCategoria}
            icon="pricetag-outline"
            placeholder="Selecione a categoria"
          />
          {categorias.length === 0 && (
            <Text style={styles.hint}>
              Nenhuma categoria cadastrada. Crie uma na aba "Categorias" antes de adicionar perguntas.
            </Text>
          )}

          <TextField
            label="Texto da Pergunta"
            placeholder="Ex: Área da máquina limpa?"
            value={pergunta}
            onChangeText={setPergunta}
            multiline
            numberOfLines={3}
            style={styles.textarea}
            icon="help-circle-outline"
          />

          <Button
            label={isEdicao ? 'Salvar Alterações' : 'Adicionar Pergunta'}
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
  hint: {
    fontSize: 12,
    color: colors.warning,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
