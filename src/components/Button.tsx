import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, GestureResponderEvent, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';

type Variant = 'primary' | 'outline' | 'danger' | 'text';

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const palette = variantPalette[variant];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={palette.labelColor} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={19}
              color={palette.labelColor}
              style={styles.icon}
            />
          ) : null}
          <Text style={[styles.label, { color: palette.labelColor }]}>{label}</Text>
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.shadowWrap,
          isDisabled && styles.disabled,
          pressed && !isDisabled && styles.pressed,
          style,
        ]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        palette.container,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.md,
    ...shadow.button,
  },
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    ...typography.sectionTitle,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
});

const variantPalette: Record<Variant, { container: ViewStyle; labelColor: string }> = {
  primary: {
    container: {},
    labelColor: colors.textInverse,
  },
  danger: {
    container: { backgroundColor: colors.danger },
    labelColor: colors.textInverse,
  },
  outline: {
    container: { backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.primary },
    labelColor: colors.primary,
  },
  text: {
    container: { backgroundColor: 'transparent', paddingVertical: spacing.sm },
    labelColor: colors.primary,
  },
};
