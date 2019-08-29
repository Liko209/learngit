/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 13:39:54
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework/ioc';
import { reaction, comparer, computed, observable } from 'mobx';
import { Disposer } from 'mobx-react';
import { AbstractNotificationManager } from '@/modules/notification/manager';
import { NOTIFICATION_PRIORITY } from '@/modules/notification/interface';
import i18nT from '@/utils/i18nT';
import { TelephonyStore } from './store';
import { TelephonyService } from './service';
import { onVoicemailNotificationClick } from './helpers';
import { CALL_STATE } from 'sdk/module/telephony/entity';
import {
  TELEPHONY_SERVICE,
  SETTING_ITEM__NOTIFICATION_INCOMING_CALLS,
  NOTIFICATION_NEW_VOICEMAILS_UUID_PREFIX,
  SETTING_ITEM__NOTIFICATION_MISS_CALL_AND_NEW_VOICEMAILS,
} from './interface/constant';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';

import { UserSettingEntity } from 'sdk/module/setting';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import SettingModel from '@/store/models/UserSetting';
import { NOTIFICATION_OPTIONS } from 'sdk/module/profile';
import { VoicemailNotification } from './store/types';

class TelephonyNotificationManager extends AbstractNotificationManager {
  @inject(TelephonyStore)
  private _telephonyStore: TelephonyStore;

  @inject(TELEPHONY_SERVICE)
  private _telephonyService: TelephonyService;

  private _disposers: Disposer[];

  @observable
  private _missCallAndVoicemailSettingItem = getEntity<
    UserSettingEntity,
    SettingModel<NOTIFICATION_OPTIONS>
  >(
    ENTITY_NAME.USER_SETTING,
    SETTING_ITEM__NOTIFICATION_MISS_CALL_AND_NEW_VOICEMAILS,
  );

  constructor() {
    super('telephony');
  }

  @computed
  get incomingCallsSettingItem() {
    return getEntity<UserSettingEntity, SettingModel<NOTIFICATION_OPTIONS>>(
      ENTITY_NAME.USER_SETTING,
      SETTING_ITEM__NOTIFICATION_INCOMING_CALLS,
    );
  }

  @computed
  get shouldShowNotification() {
    return this.incomingCallsSettingItem.value === NOTIFICATION_OPTIONS.ON;
  }

  @computed
  private get _canNotifyMissCallAndVoicemail() {
    return (
      this._missCallAndVoicemailSettingItem.value === NOTIFICATION_OPTIONS.ON
    );
  }

  init() {
    const incomingCallDisposer = reaction(
      () => ({
        callState: this._telephonyStore.callState,
        isIncomingCall: this._telephonyStore.isIncomingCall,
        isContactMatched: this._telephonyStore.isContactMatched,
      }),
      ({
        callState,
        isIncomingCall,
        isContactMatched,
      }: {
        callState: CALL_STATE;
        isIncomingCall: boolean;
        isContactMatched: boolean;
      }) => {
        if (isIncomingCall && isContactMatched) {
          this.shouldShowNotification && this._showNotification();
        } else {
          const shouldCloseNotification = [
            CALL_STATE.IDLE,
            CALL_STATE.DISCONNECTING,
            CALL_STATE.CONNECTING,
            CALL_STATE.CONNECTED,
          ];
          if (shouldCloseNotification.includes(callState)) {
            this._closeNotification();
          }
        }
      },
      {
        equals: comparer.structural,
      },
    );

    const voicemailDisposer = reaction(
      () => this._telephonyStore.voicemailNotification,
      notification =>
        this._canNotifyMissCallAndVoicemail &&
        this._notifyNewVoicemail(notification),
    );

    this._disposers = [incomingCallDisposer, voicemailDisposer];
  }

  private _notifyNewVoicemail({ id, title, body }: VoicemailNotification) {
    const uuid = `${NOTIFICATION_NEW_VOICEMAILS_UUID_PREFIX}${id}`;

    const data = {
      id: uuid,
      scope: this._scope,
      priority: NOTIFICATION_PRIORITY.MESSAGE,
    };

    const options = {
      body,
      data,
      onClick: () => onVoicemailNotificationClick(id),
      tag: uuid,
      icon: '/icon/voicemail.png',
    };

    this.show(title, options);
  }

  private async _showNotification() {
    const {
      phoneNumber,
      uuid,
      displayName,
      isMultipleCall,
    } = this._telephonyStore;
    if (!uuid) {
      return;
    }
    let { callerName } = this._telephonyStore;
    let formatNumber = phoneNumber;
    if (phoneNumber) {
      formatNumber = formatPhoneNumber(phoneNumber);
    }
    if (!displayName) {
      callerName = await i18nT('telephony.notification.unknownCaller');
    }
    const title = await i18nT('telephony.notification.incomingCall');
    this.show(title, {
      actions: [
        {
          title: await i18nT('telephony.notification.answer'),
          icon: '',
          action: 'answer',
          handler: () => {
            isMultipleCall
              ? this._telephonyService.endAndAnswer()
              : this._telephonyService.answer();
          },
        },
      ],
      requireInteraction: true,
      tag: uuid,
      data: {
        id: uuid,
        scope: this._scope,
        priority: NOTIFICATION_PRIORITY.INCOMING_CALL,
      },
      body: `${displayName || callerName} ${formatNumber}`,
      icon: '/icon/incomingCall.png',
    });
  }

  private _closeNotification() {
    this._telephonyStore.uuid && this.close(this._telephonyStore.uuid);
  }

  public dispose() {
    this._disposers.forEach(disposer => disposer());

    delete this._missCallAndVoicemailSettingItem;

    this.clear();
  }
}

export { TelephonyNotificationManager };
