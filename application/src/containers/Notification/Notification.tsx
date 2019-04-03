/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-24 14:47:35
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiSnackbarContentProps } from 'jui/components/Snackbars';
import _ from 'lodash';
import { AbstractViewModel } from '@/base';
import { observable, autorun } from 'mobx';
import { ToastProps, ToastMessageAlign } from '../ToastWrapper/Toast/types';
import { Omit } from 'jui/foundation/utils/typeHelper';

type NotificationProps = Omit<JuiSnackbarContentProps, 'id'> & {
  dismissible?: boolean;
  autoHideDuration?: number;
};

const MAX_SHOW_COUNT = 3;

class Notification extends AbstractViewModel {
  @observable
  static data: ToastProps[] = [];
  static _buffer: NotificationProps[] = [];

  private static _showNotification(props: NotificationProps) {
    if (Notification.data.length === MAX_SHOW_COUNT) {
      Notification._buffer.push(props);
      return {};
    }
    const duplicateIndex = Notification.data.findIndex(
      ({ message }) => message === props.message,
    );
    const id = Date.now();
    const dismiss = () => {
      _.remove(Notification.data, item => item.id === id);
    };
    const toast = {
      id,
      dismiss,
      ...props,
    };
    if (duplicateIndex >= 0) {
      Notification.data.splice(duplicateIndex, 1, toast);
    } else {
      Notification.data.unshift(toast);
    }
    return {
      dismiss,
    };
  }

  static flashToast(props: NotificationProps) {
    const config = {
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      autoHideDuration: 2000,
      ...props,
    };
    return Notification._showNotification(config);
  }

  static flagToast(props: NotificationProps) {
    const config = {
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      ...props,
    };
    return Notification._showNotification(config);
  }

  static checkBufferAvailability() {
    if (
      Notification.data &&
      Notification.data.length === MAX_SHOW_COUNT - 1 &&
      Notification._buffer.length > 0
    ) {
      const buffered = Notification._buffer.pop();
      if (buffered) {
        Notification._showNotification(buffered);
      }
    }
  }
}

autorun(Notification.checkBufferAvailability);

export {
  Notification,
  NotificationProps,
  NotificationProps as ShowNotificationOptions,
};
