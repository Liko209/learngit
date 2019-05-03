/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 13:39:54
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework';
import { reaction } from 'mobx';
import { Disposer } from 'mobx-react';
import { AbstractNotificationManager } from '@/modules/notification/manager';
import i18nT from '@/utils/i18nT';
import { TelephonyStore } from './store';
import { TelephonyService } from './service';
import { TELEPHONY_SERVICE } from './interface/constant';
import { CALL_STATE } from './FSM';

class TelephonyNotificationManager extends AbstractNotificationManager {
  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;
  @inject(TELEPHONY_SERVICE) private _telephonyService: TelephonyService;
  private _disposer: Disposer;
  constructor() {
    super('telephony');
  }

  init() {
    this._disposer = reaction(
      () => this._telephonyStore.callState,
      (callState: CALL_STATE) => {
        if (callState === CALL_STATE.INCOMING) {
          this._showNotification();
        } else {
          const shouldCloseNotification = [
            CALL_STATE.IDLE,
            CALL_STATE.DIALING,
            CALL_STATE.CONNECTING,
            CALL_STATE.CONNECTED,
          ];
          if (shouldCloseNotification.includes(callState)) {
            this._closeNotification();
          }
        }
      },
    );
  }

  private async _showNotification() {
    const { phoneNumber, callId } = this._telephonyStore;
    let { callerName } = this._telephonyStore;
    if (!callerName || callerName === phoneNumber || !phoneNumber) {
      callerName =
        (await i18nT('telephony.notification.unknownCaller')) ||
        'Unknown Caller';
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
      },
      body: `${callerName} ${phoneNumber}`,
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
