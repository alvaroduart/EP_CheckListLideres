import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import TextField from '../components/TextField';
import { ADMIN_PASSWORD } from '../config/appConfig';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminLogin'>;

export default function AdminLoginScreen({ navigation }: Props) {
  const [senha, setSenha] = useState('');

  const handleEntrar = () => {
    if (senha === ADMIN_PASSWORD) {
      setSenha('');
      navigation.replace('Admin');
    } else {
      Alert.alert('Senha incorreta', 'Verifique a senha de administrador e tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
    >
      <Header title="Administração" subtitle="Configurações do checklist" badge="ADMIN" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, shadow.card]}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.title}>Acesso Restrito</Text>
          <Text style={styles.description}>
            Informe a senha de administrador para gerenciar as perguntas do checklist.
          </Text>
          <TextField
            label="Senha de Administrador"
            placeholder="••••••••"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
            onSubmitEditing={handleEntrar}
            icon="key-outline"
          />
          <Button label="Entrar" icon="log-in-outline" onPress={handleEntrar} style={styles.enterButton} />
          <Button
            label="Voltar para o Checklist"
            variant="text"
            icon="arrow-back-outline"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    paddingBottom: spacing.xxl * 4,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'stretch',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  enterButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
});
