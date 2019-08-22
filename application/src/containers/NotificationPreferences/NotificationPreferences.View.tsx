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
  MUTE_ALL,
  DESKTOP_NOTIFICATION,
  SOUND_NOTIFICATION,
  MOBILE_NOTIFICATION,
  EMAIL_NOTIFICATION,
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
import { EmailNotificationTimeSourceItem } from 'src/modules/message/MessageSettingManager/EmailNotificationTimeSelectSourceItem.View';
import { notificationPreferencesShown } from './dataTrackings';

type NotificationPreferencesProps = Props & ViewProps & WithTranslation;

type MobileNotificationItemProps = {
  value: MOBILE_TEAM_NOTIFICATION_OPTIONS;
};

const MobileNotificationSourceItem = (props: MobileNotificationItemProps) => {
  const { value } = props;
  return i18nP(
    `setting.conversationPreferences.options.mobileNotification.${value}`,
  );
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
      id: SOUND_NOTIFICATION,
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
      id: MOBILE_NOTIFICATION,
      sourceRenderer: MobileNotificationSourceItem,
    };
    const disabled = currentValue[MUTE_ALL];
    return this._renderSelect<MOBILE_TEAM_NOTIFICATION_OPTIONS>(
      isTeam ? mobileTeamNotificationList : mobileDMNotificationList,
      config,
      { disabled },
    );
  };

  private _renderEmailNotification = () => {
    const { currentValue } = this.props;
    const config = {
      id: EMAIL_NOTIFICATION,
      sourceRenderer: EmailNotificationTimeSourceItem,
    };
    const disabled = currentValue[MUTE_ALL];
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
    return (
      <JuiModal
        modalProps={{
          classes: {
            paper: 'overflow-y',
          },
          scroll: 'body',
        }}
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
              id={MUTE_ALL}
              label={t(`setting.conversationPreferences.${MUTE_ALL}`)}
              divider
            >
              <RuiCheckbox
                color="primary"
                value={currentValue[MUTE_ALL]}
                onChange={handleCheckboxChange(MUTE_ALL)}
                data-test-automation-id={`${MUTE_ALL}-checkbox`}
              />
            </JuiSettingItem>
            <JuiSettingItem
              id={DESKTOP_NOTIFICATION}
              label={t(
                `setting.conversationPreferences.${DESKTOP_NOTIFICATION}`,
              )}
            >
              <RuiCheckbox
                color="primary"
                value={currentValue[DESKTOP_NOTIFICATION]}
                onChange={handleCheckboxChange(DESKTOP_NOTIFICATION)}
                data-test-automation-id={`${DESKTOP_NOTIFICATION}-checkbox`}
              />
            </JuiSettingItem>
            {this._renderSoundNotification()}
            {this._renderMobileNotification()}
            {this._renderEmailNotification()}
          </JuiSettingContainer>
        </Loading>
      </JuiModal>
    );
  }
}

const NotificationPreferencesView = withTranslation('translations')(
  NotificationPreferencesComponent,
);

export { NotificationPreferencesView };
