import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/theme';
import { RootStackParamList } from './src/types';
import { getPessoaCache } from './src/utils/pessoaCache';

export default function App() {
  const [initialRouteName, setInitialRouteName] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    getPessoaCache().then((pessoa) => {
      setInitialRouteName(pessoa ? 'Checklist' : 'Cadastro');
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {initialRouteName ? (
        <RootNavigator initialRouteName={initialRouteName} />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaProvider>
  );
}
