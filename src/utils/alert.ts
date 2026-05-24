import { Alert, Platform } from 'react-native';

type AlertButton = {
  text?: string;
  onPress?: () => void | Promise<void>;
  style?: 'default' | 'cancel' | 'destructive';
};

function runPress(handler?: () => void | Promise<void>): void {
  if (!handler) {
    return;
  }

  void Promise.resolve(handler()).catch(() => {});
}

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  const body = message ? `${title}\n\n${message}` : title;

  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  if (!buttons || buttons.length === 0) {
    window.alert(body);
    return;
  }

  if (buttons.length === 1) {
    window.alert(body);
    runPress(buttons[0]?.onPress);
    return;
  }

  const cancelButton = buttons.find((button) => button.style === 'cancel');
  const actionButtons = buttons.filter((button) => button.style !== 'cancel');
  const primaryButton =
    actionButtons.find((button) => button.style === 'destructive') ??
    actionButtons[0];

  if (window.confirm(body)) {
    runPress(primaryButton?.onPress);
  } else {
    runPress(cancelButton?.onPress);
  }
}
