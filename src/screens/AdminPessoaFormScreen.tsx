import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { atualizarPessoa, criarPessoa } from '../db/pessoasRepo';
import { listSetores } from '../db/setoresRepo';
import { colors, radius, shadow, spacing } from '../theme/theme';
import { RootStackParamList, Setor } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminPessoaForm'>;

export default function AdminPessoaFormScreen({ navigation, route }: Props) {
  const pessoaExistente = route.params?.pessoa;
  const isEdicao = !!pessoaExistente;

  const [setores, setSetores] = useState<Setor[]>([]);
  const [nome, setNome] = useState(pessoaExistente?.nome ?? '');
  const [setorId, setSetorId] = useState(pessoaExistente?.setorId ?? '');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listSetores()
      .then(setSetores)
      .catch(() => {});
  }, []);

  const setorNomeSelecionado = setores.find((s) => s.id === setorId)?.nome ?? '';

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome da pessoa.');
      return;
    }
    if (!setorId) {
      Alert.alert('Campo obrigatório', 'Selecione o setor.');
      return;
    }
    setSalvando(true);
    try {
      if (isEdicao) {
        await atualizarPessoa(pessoaExistente!.id, nome.trim(), setorId);
      } else {
        await criarPessoa(nome.trim(), setorId);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro ao salvar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <Header
        title={isEdicao ? 'Editar Pessoa' : 'Nova Pessoa'}
        subtitle="Configurações do Checklist"
        badge="ADMIN"
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, shadow.card]}>
          <TextField
            label="Nome"
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
            icon="person-outline"
          />

          <SelectField
            label="Setor"
            options={setores.map((s) => s.nome)}
            value={setorNomeSelecionado}
            onChange={(nomeSel) => {
              const setor = setores.find((s) => s.nome === nomeSel);
              setSetorId(setor?.id ?? '');
            }}
            icon="business-outline"
            placeholder="Selecione o setor"
          />
          {setores.length === 0 && (
            <Text style={styles.hint}>
              Nenhum setor cadastrado ainda. Crie um na aba "Setores" primeiro.
            </Text>
          )}

          <Button
            label={isEdicao ? 'Salvar Alterações' : 'Criar Pessoa'}
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
  saveButton: {
    marginTop: spacing.md,
  },
});
