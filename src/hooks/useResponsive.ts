import { Platform, useWindowDimensions } from 'react-native';

const WEB_WIDE_BREAKPOINT = 860;

// Só ativa nos navegadores (o app nativo no celular do líder continua exatamente igual).
export function useIsWideWeb(breakpoint: number = WEB_WIDE_BREAKPOINT): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= breakpoint;
}
