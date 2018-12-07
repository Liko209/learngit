/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-24 14:47:35
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiSnackbarContentProps } from 'jui/components/Snackbars';
import { Component } from 'react';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import _ from 'lodash';

type NotificationProps = JuiSnackbarContentProps & {
  dismissible?: boolean;
};

type ShowNotificationOptions = JuiSnackbarContentProps & {
  dismissible?: boolean;
  autoHideDuration?: number;
};

function showNotification(props: ShowNotificationOptions) {
  const id = Date.now();
  const globalStore = storeManager.getGlobalStore();
  const dismiss = () => {
    const arr = globalStore.get(GLOBAL_KEYS.TOASTS);
    _.remove(arr, (item: any) => item.id === id);
    globalStore.set(GLOBAL_KEYS.TOASTS, [...arr]);
  };
  const arr = globalStore.get(GLOBAL_KEYS.TOASTS);
  arr.push({
    id,
    dismiss,
    ...props,
  });
  globalStore.set(GLOBAL_KEYS.TOASTS, [...arr]);
  return {
    dismiss,
  };
}

class Notification extends Component<NotificationProps, {}> {
  static flashToast(props: NotificationProps) {
    const config = {
      messageAlign: 'left',
      fullWidth: false,
      autoHideDuration: 2000,
      ...props,
    };
    return showNotification(config);
  }

  static flagToast(props: NotificationProps) {
    const config = {
      messageAlign: 'left',
      fullWidth: false,
      ...props,
    };
    return showNotification(config);
  }
}

export { Notification, NotificationProps };
