import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pessoa } from '../types';

const CHAVE = '@checklist_lideranca/pessoa';

export async function getPessoaCache(): Promise<Pessoa | null> {
  try {
    const raw = await AsyncStorage.getItem(CHAVE);
    return raw ? (JSON.parse(raw) as Pessoa) : null;
  } catch {
    return null;
  }
}

export async function setPessoaCache(pessoa: Pessoa): Promise<void> {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(pessoa));
}

export async function clearPessoaCache(): Promise<void> {
  await AsyncStorage.removeItem(CHAVE);
}
