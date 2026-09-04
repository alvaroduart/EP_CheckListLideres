import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import { FOTOS_BUCKET, supabase } from '../config/supabase';
import { generateId } from './id';

export async function capturarFoto(): Promise<string | null> {
  if (Platform.OS === 'web') {
    Alert.alert('Não disponível', 'A captura de foto não está disponível na visualização web.');
    return null;
  }

  const permissao = await ImagePicker.requestCameraPermissionsAsync();
  if (!permissao.granted) {
    Alert.alert('Permissão necessária', 'Autorize o uso da câmera para anexar fotos ao checklist.');
    return null;
  }

  const resultado = await ImagePicker.launchCameraAsync({ quality: 0.5 });
  if (resultado.canceled || !resultado.assets?.[0]) return null;

  try {
    const arquivo = new File(resultado.assets[0].uri);
    const bytes = await arquivo.bytes();
    const nomeArquivo = `${generateId('foto')}.jpg`;

    const { error } = await supabase.storage
      .from(FOTOS_BUCKET)
      .upload(nomeArquivo, bytes, { contentType: 'image/jpeg' });
    if (error) throw error;

    const { data } = supabase.storage.from(FOTOS_BUCKET).getPublicUrl(nomeArquivo);
    return data.publicUrl;
  } catch {
    Alert.alert('Erro ao enviar foto', 'Verifique sua internet e tente novamente.');
    return null;
  }
}

export async function excluirFoto(url: string): Promise<void> {
  try {
    const path = url.split(`${FOTOS_BUCKET}/`).pop();
    if (!path) return;
    await supabase.storage.from(FOTOS_BUCKET).remove([path]);
  } catch {
    // a foto pode já não existir mais; ignorar
  }
}
