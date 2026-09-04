import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

interface ProgressBarProps {
  respondidas: number;
  total: number;
}

export default function ProgressBar({ respondidas, total }: ProgressBarProps) {
  const pct = total > 0 ? respondidas / total : 0;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [pct, anim]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const completo = total > 0 && respondidas === total;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Progresso do checklist</Text>
        <Text style={[styles.count, completo && styles.countComplete]}>
          {respondidas}/{total}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fillWrap, { width }]}>
          <LinearGradient
            colors={completo ? [colors.success, '#2FAE7A'] : [colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  count: {
    ...typography.label,
    color: colors.primary,
  },
  countComplete: {
    color: colors.success,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fillWrap: {
    height: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
