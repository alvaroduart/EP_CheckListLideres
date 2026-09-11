import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { listCategorias } from '../db/categoriasRepo';
import { atualizarQuestao, criarQuestao } from '../db/questoesRepo';
import { listSetores } from '../db/setoresRepo';
import { useIsWideWeb } from '../hooks/useResponsive';
import { colors, radius, shadow, spacing } from '../theme/theme';
import { Categoria, RootStackParamList, Setor } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminQuestionForm'>;

export default function AdminQuestionFormScreen({ navigation, route }: Props) {
  const isWideWeb = useIsWideWeb();
  const questaoExistente = route.params?.questao;
  const isEdicao = !!questaoExistente;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [categoriaId, setCategoriaId] = useState(questaoExistente?.categoriaId ?? '');
  const [setorId, setSetorId] = useState(questaoExistente?.setorId ?? '');
  const [pergunta, setPergunta] = useState(questaoExistente?.pergunta ?? '');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      listCategorias()
        .then(setCategorias)
        .catch(() => {});
      listSetores()
        .then(setSetores)
        .catch(() => {});
    });
    return unsubscribe;
  }, [navigation]);

  const categoriaNomeSelecionado = categorias.find((c) => c.id === categoriaId)?.nome ?? '';
  const opcoesCategoria = categorias.map((c) => c.nome);
  const setorNomeSelecionado = setores.find((s) => s.id === setorId)?.nome ?? '';
  const opcoesSetor = setores.map((s) => s.nome);

  const handleSelecionarCategoria = (nome: string) => {
    const categoria = categorias.find((c) => c.nome === nome);
    if (categoria) setCategoriaId(categoria.id);
  };

  const handleSelecionarSetor = (nome: string) => {
    const setor = setores.find((s) => s.nome === nome);
    if (setor) setSetorId(setor.id);
  };

  const handleSalvar = async () => {
    if (!categoriaId) {
      Alert.alert('Campo obrigatório', 'Selecione a categoria da pergunta.');
      return;
    }
    if (!setorId) {
      Alert.alert('Campo obrigatório', 'Selecione o setor da pergunta.');
      return;
    }
    if (!pergunta.trim()) {
      Alert.alert('Campo obrigatório', 'Preencha o texto da pergunta.');
      return;
    }
    setSalvando(true);
    try {
      if (isEdicao) {
        await atualizarQuestao(questaoExistente!.id, categoriaId, setorId, pergunta.trim());
      } else {
        await criarQuestao(categoriaId, setorId, pergunta.trim());
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
      <ScrollView
        contentContainerStyle={[styles.content, isWideWeb && styles.contentWideWeb]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, shadow.card, isWideWeb && styles.cardWideWeb]}>
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

          <SelectField
            label="Setor"
            options={opcoesSetor}
            value={setorNomeSelecionado}
            onChange={handleSelecionarSetor}
            icon="business-outline"
            placeholder="Selecione o setor"
          />
          {setores.length === 0 && (
            <Text style={styles.hint}>
              Nenhum setor cadastrado. Crie um na aba "Setores" antes de adicionar perguntas.
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
  contentWideWeb: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardWideWeb: {
    width: '100%',
    maxWidth: 560,
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
