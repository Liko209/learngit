/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-14 17:55:08
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiModal } from 'jui/components/Dialog';
import { Props, ViewProps } from './types';
import {
  MUTED,
  DESKTOP_NOTIFICATIONS,
  SOUND_NOTIFICATIONS,
  MOBILE_NOTIFICATIONS,
  EMAIL_NOTIFICATIONS,
} from './constant';
import { Loading } from 'jui/hoc/withLoading';
import { JuiSettingItem, JuiSettingContainer } from 'jui/pattern/DialogSetting';
import { RuiCheckbox } from 'rcui/components/Checkbox';
import { JuiSelect, SelectConfig } from 'jui/pattern/Select';
import {
  SoundSourceItem,
  SoundSourcePlayerRenderer,
} from '@/modules/setting/container/SettingItem/Select/SoundSourceItem.View';
import {
  SoundsListWithDefault,
  AUDIO_SOUNDS_INFO,
  EMAIL_NOTIFICATION_OPTIONS,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  mobileDMNotificationList,
  mobileTeamNotificationList,
  emailNotificationList,
} from 'sdk/module/profile/constants';
import { i18nP } from '@/utils/i18nT';
import { notificationPreferencesShown } from './dataTrackings';
import { withEscTracking } from '@/containers/Dialog';
import { EmailNotificationTimeSourceItem } from '@/modules/message/MessageSettingManager/EmailNotificationTimeSelectSourceItem.View';

type NotificationPreferencesProps = Props & ViewProps & WithTranslation;

type MobileNotificationItemProps = {
  value: MOBILE_TEAM_NOTIFICATION_OPTIONS;
};

const Modal = withEscTracking(JuiModal);
const MobileNotificationSourceItem = (props: MobileNotificationItemProps) => {
  const { value } = props;
  return i18nP(
    `setting.conversationPreferences.options.mobileNotifications.${value}`,
  );
};

const ModalProps = {
  classes: {
    paper: 'overflow-y',
  },
  scroll: 'body',
};

@observer
class NotificationPreferencesComponent extends React.Component<
  NotificationPreferencesProps
> {
  private _renderSelect = <T extends {}>(
    source: T[],
    config: SelectConfig<T>,
    styles: {
      disabled: boolean;
      indent?: boolean;
    },
  ) => {
    const { t, currentValue, handleSelectChange } = this.props;
    const { id } = config;
    const { disabled, indent } = styles;
    return (
      <JuiSettingItem
        id={id}
        disabled={disabled}
        label={t(`setting.conversationPreferences.${id}`)}
        indent={!!indent}
      >
        <JuiSelect
          rawValue={currentValue[id]}
          disabled={disabled}
          source={source}
          config={config}
          handleChange={handleSelectChange<T>(id as string)}
        />
      </JuiSettingItem>
    );
  };

  private _renderSoundNotification = () => {
    const { soundNotificationsDisabled } = this.props;
    const config = {
      id: SOUND_NOTIFICATIONS,
      sourceRenderer: SoundSourceItem,
      secondaryActionRenderer: SoundSourcePlayerRenderer,
    };
    return this._renderSelect<AUDIO_SOUNDS_INFO>(
      SoundsListWithDefault,
      config,
      { disabled: soundNotificationsDisabled, indent: true },
    );
  };

  private _renderMobileNotification = () => {
    const { currentValue, isTeam } = this.props;
    const config = {
      id: MOBILE_NOTIFICATIONS,
      sourceRenderer: MobileNotificationSourceItem,
    };
    const disabled = currentValue[MUTED];
    return this._renderSelect<MOBILE_TEAM_NOTIFICATION_OPTIONS>(
      isTeam ? mobileTeamNotificationList : mobileDMNotificationList,
      config,
      { disabled },
    );
  };

  private _renderEmailNotification = () => {
    const { currentValue } = this.props;
    const config = {
      id: EMAIL_NOTIFICATIONS,
      sourceRenderer: EmailNotificationTimeSourceItem,
    };
    const disabled = currentValue[MUTED];
    return this._renderSelect<EMAIL_NOTIFICATION_OPTIONS>(
      emailNotificationList,
      config,
      {
        disabled,
      },
    );
  };

  componentDidMount() {
    notificationPreferencesShown();
  }

  render() {
    const {
      t,
      loading,
      currentValue,
      handleCheckboxChange,
      handleSubmit,
      handleClose,
    } = this.props;
    const isMuted = currentValue[MUTED];
    return (
      <Modal
        modalProps={ModalProps}
        open
        size={'medium'}
        title={t('setting.conversationPreferences.title')}
        onCancel={handleClose}
        onOK={handleSubmit}
        okText={t('common.dialog.save')}
        cancelText={t('common.dialog.cancel')}
      >
        <Loading loading={loading} alwaysComponentShow delay={0}>
          <JuiSettingContainer>
            <JuiSettingItem
              id={MUTED}
              label={t(`setting.conversationPreferences.${MUTED}`)}
              divider
            >
              {currentValue[MUTED] !== undefined && (
                <RuiCheckbox
                  color="primary"
                  checked={currentValue[MUTED]}
                  onChange={handleCheckboxChange(MUTED)}
                  data-test-automation-id={`${MUTED}-checkbox`}
                  inputProps={{
                    'aria-labelledby': MUTED,
                  }}
                />
              )}
            </JuiSettingItem>
            <JuiSettingItem
              id={DESKTOP_NOTIFICATIONS}
              label={t(
                `setting.conversationPreferences.${DESKTOP_NOTIFICATIONS}`,
              )}
              disabled={isMuted}
            >
              {currentValue[DESKTOP_NOTIFICATIONS] !== undefined && (
                <RuiCheckbox
                  color="primary"
                  checked={currentValue[DESKTOP_NOTIFICATIONS]}
                  onChange={handleCheckboxChange(DESKTOP_NOTIFICATIONS)}
                  data-test-automation-id={`${DESKTOP_NOTIFICATIONS}-checkbox`}
                  inputProps={{
                    'aria-labelledby': DESKTOP_NOTIFICATIONS,
                  }}
                  disabled={isMuted}
                />
              )}
            </JuiSettingItem>
            {this._renderSoundNotification()}
            {this._renderMobileNotification()}
            {this._renderEmailNotification()}
          </JuiSettingContainer>
        </Loading>
      </Modal>
    );
  }
}

const NotificationPreferencesView = withTranslation('translations')(
  NotificationPreferencesComponent,
);

export { NotificationPreferencesView };
