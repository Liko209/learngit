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
import { INotificationPermission } from '@/modules/notification/interface';
import { jupiter } from 'framework';

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
  get _permission(): INotificationPermission {
    return jupiter.get(INotificationPermission);
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      dialogOpen: false,
      isPending: false,
    };
  }

  handleToggleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    const browserPermission = this.props.settingItemEntity.value!
      .browserPermission;
    if (browserPermission !== PERMISSION.DEFAULT) {
      this.props.setToggleState(checked);
    }
    if (checked) {
      switch (browserPermission) {
        case PERMISSION.DEFAULT:
          this.setState({
            isPending: true,
          });
          const permission = await this._permission.request();
          this.setState({
            isPending: false,
          });
          if (permission === PERMISSION.DENIED) {
            this.setState({
              dialogOpen: true,
            });
          }
          if (permission === PERMISSION.GRANTED) {
            this.props.setToggleState(checked);
            // alessia[todo]: Trigger Notification: "Notifications are now enabled."
          }
          break;
        case PERMISSION.GRANTED:
          // alessia[todo]: Trigger Notification: "Notifications are now enabled."
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

    return (
      <JuiSettingSectionItem
        id="notificationBrowserSetting"
        label={label}
        description={description}
      >
        <JuiToggleButton
          data-test-automation-id="notificationBrowserSettingToggleButton"
          checked={this.state.isPending || desktopNotifications || false}
          onChange={this.handleToggleChange}
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
