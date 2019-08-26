/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-29 14:31:57
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { NotificationBrowserSettingItemViewProps } from './types';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { JuiToggleButton } from 'jui/components/Buttons';
import { PERMISSION } from '@/modules/notification/Permission';
import {
  INotificationPermission,
  INotificationService,
  NOTIFICATION_PRIORITY,
} from '@/modules/notification/interface';
import { jupiter } from 'framework/Jupiter';
import { Notification } from '@/containers/Notification';
import i18nT from '@/utils/i18nT';
import { dataAnalysis } from 'foundation/analysis';
import { catchError } from '@/common/catchError';

const NOTIFICATION_BROWSER = 'NotificationBrowserSettingItem';
type Props = WithTranslation & NotificationBrowserSettingItemViewProps;
type State = {
  waitForPermission: boolean;
};
@observer
class NotificationBrowserSettingItemViewComponent extends Component<
  Props,
  State
> {
  private get _permission(): INotificationPermission {
    return jupiter.get(INotificationPermission);
  }
  private get _notificationService(): INotificationService {
    return jupiter.get(INotificationService);
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      waitForPermission: false,
    };
  }

  private _onNotificationDenied = () => {
    Notification.flagWarningToast('notification.notificationPermissionBlocked');

    dataAnalysis.track('Jup_Web/DT_settings_notification_blocked', {
      endPoint: 'web',
    });
  };

  private _showEnabledNotification = async () => {
    const title = await i18nT('notification.notificationEnabled');
    this._notificationService.show(
      title,
      {
        data: {
          id: new Date().toISOString(),
          scope: NOTIFICATION_BROWSER,
          priority: NOTIFICATION_PRIORITY.INFORMATION,
        },
        silent: false,
        renotify: true,
      },
      true,
    );
  };

  private _requestPermission = async () => {
    this.setState({
      waitForPermission: true,
    });
    const permission = await this._permission.request();
    return permission;
  };

  @catchError.flash({
    network: 'setting.errorText.network',
    server: 'setting.errorText.server',
  })
  handleToggleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    const browserPermission = this._permission.current;
    /* eslint-disable */
    if (checked) {
      switch (browserPermission) {
        case PERMISSION.DEFAULT:
          const permission = await this._requestPermission();
          try {
            if (permission === PERMISSION.DENIED) {
              this._onNotificationDenied();
            }
            if (permission === PERMISSION.GRANTED) {
              await this.props.setToggleState(checked);
              this._showEnabledNotification();
            }
          } catch (error) {
            throw error;
          } finally {
            this.setState({
              waitForPermission: false,
            });
          }
          break;
        case PERMISSION.GRANTED:
          await this.props.setToggleState(checked);
          this._showEnabledNotification();
          break;
        case PERMISSION.DENIED:
          this._onNotificationDenied();
          break;
        default:
          break;
      }
    } else {
      await this.props.setToggleState(checked);
    }
  };

  render() {
    const {
      t,
      settingItemEntity: { value },
    } = this.props;
    const desktopNotifications = value && value.desktopNotifications;
    const label = t(
      'setting.notificationAndSounds.desktopNotifications.notificationsForBrowser.label',
    );
    const description = t(
      'setting.notificationAndSounds.desktopNotifications.notificationsForBrowser.description',
    );

    const checked =
      this.state.waitForPermission || desktopNotifications || false;
    const hidden = desktopNotifications === undefined;
    return (
      <JuiSettingSectionItem
        id="notificationBrowserSetting"
        automationId="notificationBrowser"
        label={label}
        description={description}
      >
        {!hidden && (
          <JuiToggleButton
            data-test-automation-id="settingItemToggleButton-notificationBrowser"
            checked={checked}
            onChange={this.handleToggleChange}
            aria-label={
              checked
                ? t('common.button.ariaToggleOn')
                : t('common.button.ariaToggleOff')
            }
          />
        )}
      </JuiSettingSectionItem>
    );
  }
}

const NotificationBrowserSettingItemView = withTranslation('translations')(
  NotificationBrowserSettingItemViewComponent,
);

export { NotificationBrowserSettingItemView };
