import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdminCategoryFormScreen from '../screens/AdminCategoryFormScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminQuestionFormScreen from '../screens/AdminQuestionFormScreen';
import AdminScreen from '../screens/AdminScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Checklist" component={ChecklistScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="AdminQuestionForm" component={AdminQuestionFormScreen} />
        <Stack.Screen name="AdminCategoryForm" component={AdminCategoryFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
