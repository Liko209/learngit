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

const NOTIFICATION_BROWSER = 'NotificationBrowserSettingItem';
type Props = WithTranslation & NotificationBrowserSettingItemViewProps;
type State = {
  dialogOpen: boolean;
  isPending: boolean;
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
      isPending: false,
    };
  }

  private handleDialogClose = () => {
    this.setState({
      dialogOpen: false,
    });
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
          onOK={this.handleDialogClose}
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
      isPending: true,
    });
    const permission = await this._permission.request();
    setTimeout(() => {
      this.setState({
        isPending: false,
      });
    },         0);
    return permission;
  }

  handleToggleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    const browserPermission =
      this.props.settingItemEntity.value &&
      this.props.settingItemEntity.value.browserPermission;
    if (browserPermission !== PERMISSION.DEFAULT) {
      this.props.setToggleState(checked);
    }
    if (checked) {
      switch (browserPermission) {
        case PERMISSION.DEFAULT:
          const permission = await this._requestPermission();
          if (permission === PERMISSION.DENIED) {
            this.setState({
              dialogOpen: true,
            });
          }
          if (permission === PERMISSION.GRANTED) {
            this.props.setToggleState(checked);
            this._showEnabledNotification();
          }
          break;
        case PERMISSION.GRANTED:
          this._showEnabledNotification();
          break;
        case PERMISSION.DENIED:
          this.setState({
            dialogOpen: true,
          });
          break;
        default:
          break;
      }
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

    const checked = this.state.isPending || desktopNotifications || false;
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
