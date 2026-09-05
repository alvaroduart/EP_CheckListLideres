import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow, spacing, typography } from '../theme/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
  unreadCount?: number;
}

export default function Header({
  title,
  subtitle,
  badge,
  onSettingsPress,
  onNotificationsPress,
  unreadCount = 0,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentStrip}
      />
      <View style={styles.container}>
        <Image
          source={require('../../assets/logo-full.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Electro Plastic"
        />
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.subtitleRow}>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            {badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
          </View>
        </View>
        {onNotificationsPress ? (
          <Pressable
            onPress={onNotificationsPress}
            accessibilityRole="button"
            accessibilityLabel="Notificações"
            style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            {unreadCount > 0 ? (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
        {onSettingsPress ? (
          <Pressable
            onPress={onSettingsPress}
            accessibilityRole="button"
            accessibilityLabel="Área de Administração"
            style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
          >
            <Ionicons name="settings-outline" size={22} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    ...shadow.header,
    zIndex: 10,
  },
  accentStrip: {
    height: 4,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  logo: {
    width: 56,
    height: 56,
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.title,
    color: colors.primary,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  settingsButtonPressed: {
    opacity: 0.7,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  notifBadgeText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: '800',
  },
});
