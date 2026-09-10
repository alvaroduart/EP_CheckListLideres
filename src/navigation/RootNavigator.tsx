import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdminCategoryFormScreen from '../screens/AdminCategoryFormScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminPessoaFormScreen from '../screens/AdminPessoaFormScreen';
import AdminQuestionFormScreen from '../screens/AdminQuestionFormScreen';
import AdminScreen from '../screens/AdminScreen';
import AdminSetorFormScreen from '../screens/AdminSetorFormScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';
import SelecionarUsuarioScreen from '../screens/SelecionarUsuarioScreen';
import TarefaDetalheScreen from '../screens/TarefaDetalheScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  initialRouteName: keyof RootStackParamList;
}

export default function RootNavigator({ initialRouteName }: RootNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
        <Stack.Screen name="SelecionarUsuario" component={SelecionarUsuarioScreen} />
        <Stack.Screen name="Checklist" component={ChecklistScreen} />
        <Stack.Screen name="Notificacoes" component={NotificacoesScreen} />
        <Stack.Screen name="TarefaDetalhe" component={TarefaDetalheScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="AdminQuestionForm" component={AdminQuestionFormScreen} />
        <Stack.Screen name="AdminCategoryForm" component={AdminCategoryFormScreen} />
        <Stack.Screen name="AdminSetorForm" component={AdminSetorFormScreen} />
        <Stack.Screen name="AdminPessoaForm" component={AdminPessoaFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
