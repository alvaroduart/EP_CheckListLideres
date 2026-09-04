export const colors = {
  primary: '#20265B',
  primaryDark: '#12163A',
  primaryLight: '#3A4291',
  secondary: '#000000',
  background: '#FFFFFF',
  backgroundAlt: '#F7F8FC',
  card: '#F5F5F7',
  border: '#E7E8F0',
  textPrimary: '#101223',
  textSecondary: '#5B5E72',
  textInverse: '#FFFFFF',
  success: '#1E8A5F',
  successBg: '#E4F5EC',
  danger: '#C0392B',
  dangerBg: '#FBE9E7',
  warning: '#C17A00',
  warningBg: '#FCF1DC',
  placeholder: '#9A9CB0',
  shadow: '#12163A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 20, fontWeight: '800' as const, letterSpacing: 0.1 },
  subtitle: { fontSize: 14, fontWeight: '500' as const },
  sectionTitle: { fontSize: 16, fontWeight: '800' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 12.5, fontWeight: '700' as const, letterSpacing: 0.3 },
};

export const shadow = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  header: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

import { CategoriaIcone } from '../types';

export const CATEGORY_COLOR_PALETTE: { cor: string; corFundo: string }[] = [
  { cor: '#1E8A5F', corFundo: '#E4F5EC' },
  { cor: '#C17A00', corFundo: '#FCF1DC' },
  { cor: '#B03A2E', corFundo: '#FBE7E4' },
  { cor: '#20265B', corFundo: '#E7E8F5' },
  { cor: '#0E7C8C', corFundo: '#E1F2F4' },
  { cor: '#6B3FA0', corFundo: '#EFE6F7' },
];

export function pickCategoryColor(index: number) {
  return CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length];
}

export const CATEGORY_ICON_CHOICES: CategoriaIcone[] = [
  'broom',
  'shield-check-outline',
  'cog-outline',
  'hard-hat',
  'toolbox-outline',
  'clipboard-check-outline',
  'fire-extinguisher',
  'forklift',
  'recycle',
  'spray-bottle',
  'alert-circle-outline',
  'account-hard-hat-outline',
];
