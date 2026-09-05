import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // ambiente sem suporte a notificações (ex.: Expo Go no Android); ignorar
}

/**
 * Notificações push remotas (getExpoPushTokenAsync) não são suportadas dentro
 * do Expo Go no Android desde o SDK 53 — só funcionam num build de verdade
 * (APK gerado via EAS Build). Fora desse ambiente, nem tentamos.
 */
function suportaPushRemoto(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.Standalone;
}

export async function registrarPushToken(): Promise<string | null> {
  if (!suportaPushRemoto()) return null;

  try {
    if (!Device.isDevice) return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Padrão',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#20265B',
      });
    }

    const { status: statusAtual } = await Notifications.getPermissionsAsync();
    let status = statusAtual;
    if (status !== 'granted') {
      const resultado = await Notifications.requestPermissionsAsync();
      status = resultado.status;
    }
    if (status !== 'granted') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return null;

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}

interface EnvioPush {
  pushToken: string;
  titulo: string;
  mensagem: string;
  data?: Record<string, unknown>;
}

export async function enviarPushEmMassa(itens: EnvioPush[]): Promise<void> {
  const validos = itens.filter((item) => !!item.pushToken);
  if (validos.length === 0) return;

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(
        validos.map((item) => ({
          to: item.pushToken,
          title: item.titulo,
          body: item.mensagem,
          data: item.data ?? {},
        }))
      ),
    });
  } catch {
    // Falha ao enviar push não deve travar o restante do fluxo — a
    // notificação já foi gravada na central dentro do app de qualquer forma.
  }
}
