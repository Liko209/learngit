/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-28 10:29:29
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  JuiSnackbarContent,
  JuiSnackbarAction,
} from 'jui/components/Snackbars';
import { observer } from 'mobx-react';
import { ToastType } from '@/containers/ToastWrapper/Toast/types';
import { NotificationEnableBannerViewProps } from './types';
import { jupiter } from 'framework/Jupiter';
import {
  INotificationPermission,
  INotificationService,
  NOTIFICATION_PRIORITY,
} from '@/modules/notification/interface';
import { PERMISSION } from '@/modules/notification/Permission';
import i18nT from '@/utils/i18nT';

const NOTIFICATION_BANNER = 'NotificationEnableBanner';

@observer
class NotificationEnableBannerViewComponent extends React.Component<
  NotificationEnableBannerViewProps
  > {
  private get _permission(): INotificationPermission {
    return jupiter.get(INotificationPermission);
  }
  private get _notificationService(): INotificationService {
    return jupiter.get(INotificationService);
  }

  enableNotification = async () => {
    const permission = await this._permission.request();
    if (permission === PERMISSION.GRANTED) {
      const title = await i18nT('notification.notificationEnabled');
      this._notificationService.show(title, {
        data: {
          id: NOTIFICATION_BANNER,
          scope: NOTIFICATION_BANNER,
          priority: NOTIFICATION_PRIORITY.INFORMATION,
        },
      });
    }
  };

  render() {
    const {
      t, isShow, isBlocked, handleClose,
    } = this.props;
    const translationKey = `notification.topBanner.${
      isBlocked ? 'blockedPermissionMessage' : 'enablePermissionMessage'
    }`;
    return isShow ? (
      <JuiSnackbarContent
        type={ToastType.INFO}
        message={t(translationKey)}
        messageAlign="center"
        fullWidth
        action={[
          !isBlocked ? (
            <JuiSnackbarAction key="enable" onClick={this.enableNotification}>
              {t('notification.topBanner.enablePermissionAction')}
            </JuiSnackbarAction>
          ) : null,
          <JuiSnackbarAction key="close" variant="icon" onClick={handleClose}>
            close
          </JuiSnackbarAction>,
        ]}
      />
    ) : null;
  }
}

const NotificationEnableBannerView = withTranslation()(
  NotificationEnableBannerViewComponent,
);
export { NotificationEnableBannerView };
