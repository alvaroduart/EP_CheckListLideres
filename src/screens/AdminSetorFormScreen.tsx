import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import TextField from '../components/TextField';
import { atualizarSetor, criarSetor } from '../db/setoresRepo';
import { colors, radius, shadow, spacing } from '../theme/theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminSetorForm'>;

export default function AdminSetorFormScreen({ navigation, route }: Props) {
  const setorExistente = route.params?.setor;
  const isEdicao = !!setorExistente;

  const [nome, setNome] = useState(setorExistente?.nome ?? '');
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do setor.');
      return;
    }
    setSalvando(true);
    try {
      if (isEdicao) {
        await atualizarSetor(setorExistente!.id, nome.trim());
      } else {
        await criarSetor(nome.trim());
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
        title={isEdicao ? 'Editar Setor' : 'Novo Setor'}
        subtitle="Configurações do Checklist"
        badge="ADMIN"
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, shadow.card]}>
          <TextField
            label="Nome do Setor"
            placeholder="Ex: Produção, Manutenção, Qualidade..."
            value={nome}
            onChangeText={setNome}
            icon="business-outline"
          />

          <Button
            label={isEdicao ? 'Salvar Alterações' : 'Criar Setor'}
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
  saveButton: {
    marginTop: spacing.md,
  },
});
