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

const notificationData = observable<ToastProps>([]);

class Notification extends AbstractViewModel {
  static _buffer: NotificationProps[] = [];

  private static _showNotification(props: NotificationProps) {
    if (notificationData.length === MAX_SHOW_COUNT) {
      Notification._buffer.push(props);
      return {};
    }
    const duplicateIndex = notificationData.findIndex(
      ({ message }) => message === props.message,
    );
    const id = Date.now();
    const dismiss = () => {
      _.remove(notificationData, item => item.id === id);
    };
    const toast = {
      id,
      dismiss,
      ...props,
    };
    if (duplicateIndex >= 0) {
      notificationData.splice(duplicateIndex, 1, toast);
    } else {
      notificationData.unshift(toast);
    }
    return {
      dismiss,
    };
  }

  static flashToast(props: NotificationProps) {
    const config = {
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      autoHideDuration: 3000,
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
      notificationData &&
      notificationData.length === MAX_SHOW_COUNT - 1 &&
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
  notificationData,
  Notification,
  NotificationProps,
  NotificationProps as ShowNotificationOptions,
};
