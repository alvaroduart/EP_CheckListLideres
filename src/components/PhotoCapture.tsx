import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { capturarFoto, excluirFoto } from '../utils/photos';

interface PhotoCaptureProps {
  fotoUri?: string | null;
  onChange: (uri: string | null) => void;
}

export default function PhotoCapture({ fotoUri, onChange }: PhotoCaptureProps) {
  const [loading, setLoading] = useState(false);

  const handleCapturar = async () => {
    setLoading(true);
    const uri = await capturarFoto();
    setLoading(false);
    if (uri) {
      if (fotoUri) excluirFoto(fotoUri);
      onChange(uri);
    }
  };

  const handleRemover = () => {
    if (fotoUri) excluirFoto(fotoUri);
    onChange(null);
  };

  if (fotoUri) {
    return (
      <View style={styles.row}>
        <Image source={{ uri: fotoUri }} style={styles.thumb} />
        <Pressable onPress={handleCapturar} style={styles.smallAction} disabled={loading}>
          <Ionicons name="camera-outline" size={14} color={colors.primary} />
          <Text style={styles.smallActionText}>Refazer</Text>
        </Pressable>
        <Pressable onPress={handleRemover} style={styles.smallAction} disabled={loading}>
          <Ionicons name="trash-outline" size={14} color={colors.danger} />
          <Text style={[styles.smallActionText, styles.removeText]}>Remover</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handleCapturar}
      disabled={loading}
      style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <Ionicons name="camera-outline" size={16} color={colors.primary} />
          <Text style={styles.addButtonText}>Anexar foto</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.card,
  },
  smallAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 3,
  },
  removeText: {
    color: colors.danger,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
  },
});
