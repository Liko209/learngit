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
import { JuiModal } from 'jui/components/Dialog';
import { PERMISSION } from '@/modules/notification/Permission';
import {
  INotificationPermission,
  INotificationService,
  NOTIFICATION_PRIORITY,
} from '@/modules/notification/interface';
import { jupiter } from 'framework';
import i18nT from '@/utils/i18nT';
import { dataAnalysis } from 'sdk';

const NOTIFICATION_BROWSER = 'NotificationBrowserSettingItem';
type Props = WithTranslation & NotificationBrowserSettingItemViewProps;
type State = {
  dialogOpen: boolean;
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
      dialogOpen: false,
      waitForPermission: false,
    };
  }

  private _handleDialog = (isShow: boolean) => {
    this.setState({
      dialogOpen: isShow,
    });
    if (isShow) {
      dataAnalysis.page('Jup_Web/DT_settings_notification_blocked');
    } else {
      dataAnalysis.track(
        'Jup_Web_settings_DesktopNotifications_blocked_closeDialog',
      );
    }
  }

  private _handleDialogClose = () => {
    this._handleDialog(false);
  }

  private _renderDialog() {
    const { t } = this.props;
    const dialogTitle = t('notification.notificationBlockedDialog.title');
    const dialogContent = t('notification.notificationBlockedDialog.content');
    const dialogButton = t('notification.notificationBlockedDialog.button');
    return (
      this.state.dialogOpen && (
        <JuiModal
          open={this.state.dialogOpen}
          content={dialogContent}
          okText={dialogButton}
          title={dialogTitle}
          onOK={this._handleDialogClose}
        />
      )
    );
  }

  private _showEnabledNotification = async () => {
    const title = await i18nT('notification.notificationEnabled');
    this._notificationService.show(title, {
      data: {
        id: NOTIFICATION_BROWSER,
        scope: NOTIFICATION_BROWSER,
        priority: NOTIFICATION_PRIORITY.INFORMATION,
      },
    });
  }

  private _requestPermission = async () => {
    this.setState({
      waitForPermission: true,
    });
    const permission = await this._permission.request();
    return permission;
  }

  handleToggleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    const browserPermission =
      this.props.settingItemEntity.value &&
      this.props.settingItemEntity.value.browserPermission;
    if (checked) {
      switch (browserPermission) {
        case PERMISSION.DEFAULT:
          const permission = await this._requestPermission();
          if (permission === PERMISSION.DENIED) {
            this._handleDialog(true);
          }
          if (permission === PERMISSION.GRANTED) {
            await this.props.setToggleState(checked);
            this._showEnabledNotification();
          }
          this.setState({
            waitForPermission: false,
          });
          break;
        case PERMISSION.GRANTED:
          await this.props.setToggleState(checked);
          this._showEnabledNotification();
          break;
        case PERMISSION.DENIED:
          this._handleDialog(true);
          break;
        default:
          break;
      }
    } else {
      this.props.setToggleState(checked);
    }
  }

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
    return (
      <JuiSettingSectionItem
        id="notificationBrowserSetting"
        automationId="notificationBrowser"
        label={label}
        description={description}
      >
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
        {this._renderDialog()}
      </JuiSettingSectionItem>
    );
  }
}

const NotificationBrowserSettingItemView = withTranslation('translations')(
  NotificationBrowserSettingItemViewComponent,
);

export { NotificationBrowserSettingItemView };
