/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 13:39:54
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework';
import { reaction, comparer } from 'mobx';
import { Disposer } from 'mobx-react';
import { AbstractNotificationManager } from '@/modules/notification/manager';
import { NOTIFICATION_PRIORITY } from '@/modules/notification/interface';
import i18nT from '@/utils/i18nT';
import { TelephonyStore } from './store';
import { TelephonyService } from './service';
import { TELEPHONY_SERVICE } from './interface/constant';
// import { CALL_STATE } from './FSM';
import { CALL_STATE } from 'sdk/module/telephony/entity';

class TelephonyNotificationManager extends AbstractNotificationManager {
  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;
  @inject(TELEPHONY_SERVICE) private _telephonyService: TelephonyService;
  private _disposer: Disposer;
  constructor() {
    super('telephony');
  }

  init() {
    this._disposer = reaction(
      () => ({
        callState: this._telephonyStore.callState,
        hasIncomingCall: this._telephonyStore.hasIncomingCall,
        isContactMatched: this._telephonyStore.isContactMatched,
      }),
      ({
        callState,
        hasIncomingCall,
        isContactMatched,
      }: {
        callState: CALL_STATE;
        hasIncomingCall: boolean;
        isContactMatched: boolean;
      }) => {
        if (hasIncomingCall && isContactMatched) {
          this._showNotification();
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
    const { phoneNumber, callId, displayName } = this._telephonyStore;
    let { callerName } = this._telephonyStore;
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
      tag: callId,
      data: {
        id: callId,
        scope: this._scope,
        priority: NOTIFICATION_PRIORITY.INCOMING_CALL,
      },
      body: `${displayName || callerName} ${phoneNumber}`,
      icon: '/icon/incomingCall.png',
    });
  }

  private _closeNotification() {
    this._telephonyStore.callId && this.close(this._telephonyStore.callId);
  }

  public dispose() {
    this._disposer && this._disposer();
    this.clear();
  }
}

export { TelephonyNotificationManager };
