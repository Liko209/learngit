/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-24 14:47:35
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiSnackbarContentProps } from 'jui/components/Snackbars';
import _ from 'lodash';
import { AbstractViewModel } from '@/base';
import { observable, action } from 'mobx';

type NotificationProps = JuiSnackbarContentProps & {
  dismissible?: boolean;
};

type ShowNotificationOptions = NotificationProps & {
  autoHideDuration?: number;
};

class Notification extends AbstractViewModel {
  @observable
  static data: object[] = [];

  @action
  private static _showNotification(props: ShowNotificationOptions) {
    const id = Date.now();
    const dismiss = () => {
      _.remove(Notification.data, (item: any) => item.id === id);
    };
    Notification.data.push({
      id,
      dismiss,
      ...props,
    });
    return {
      dismiss,
    };
  }

  static flashToast(props: NotificationProps) {
    const config = {
      messageAlign: 'left',
      fullWidth: false,
      autoHideDuration: 2000,
      ...props,
    };
    return Notification._showNotification(config);
  }

  static flagToast(props: NotificationProps) {
    const config = {
      messageAlign: 'left',
      fullWidth: false,
      ...props,
    };
    return Notification._showNotification(config);
  }
}

export { Notification, NotificationProps, ShowNotificationOptions };
