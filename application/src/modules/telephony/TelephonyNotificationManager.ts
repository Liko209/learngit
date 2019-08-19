/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 13:39:54
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework/ioc';
import { reaction, comparer, computed } from 'mobx';
import { Disposer } from 'mobx-react';
import { AbstractNotificationManager } from '@/modules/notification/manager';
import { NOTIFICATION_PRIORITY } from '@/modules/notification/interface';
import i18nT from '@/utils/i18nT';
import { TelephonyStore } from './store';
import { TelephonyService } from './service';
import { CALL_STATE } from 'sdk/module/telephony/entity';
import {
  TELEPHONY_SERVICE,
  SETTING_ITEM__NOTIFICATION_INCOMING_CALLS,
} from './interface/constant';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';

import { UserSettingEntity } from 'sdk/module/setting';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import SettingModel from '@/store/models/UserSetting';
import { NOTIFICATION_OPTIONS } from 'sdk/module/profile';

class TelephonyNotificationManager extends AbstractNotificationManager {
  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;
  @inject(TELEPHONY_SERVICE) private _telephonyService: TelephonyService;
  private _disposer: Disposer;
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

  init() {
    this._disposer = reaction(
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
            CALL_STATE.DISCONNECTED,
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
  }

  private async _showNotification() {
    const { phoneNumber, uuid, displayName } = this._telephonyStore;
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
            this._telephonyService.answer();
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
    this._disposer && this._disposer();
    this.clear();
  }
}

export { TelephonyNotificationManager };
