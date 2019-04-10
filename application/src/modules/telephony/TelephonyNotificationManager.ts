/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 13:39:54
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework';
import { reaction } from 'mobx';
import { NotificationManager } from '@/modules/notification/manager';
import i18nT from '@/utils/i18nT';
import { TelephonyStore } from './store';
import { TelephonyService } from './service';
import { CALL_STATE } from './FSM';

type Action = 'SHOW' | 'CLOSE' | 'DISPOSE';

class TelephonyNotificationManager extends NotificationManager {
  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;
  @inject(TelephonyService) private _telephonyService: TelephonyService;

  constructor() {
    super('telephony');
  }

  init() {
    reaction(
      () => this._telephonyStore.callState,
      (callState: CALL_STATE) => {
        if (callState === CALL_STATE.INCOMING) {
          this.dispatch('SHOW');
        } else {
          this.dispatch('CLOSE');
        }
      },
    );
  }

  async dispatch(action: Action) {
    switch (action) {
      case 'SHOW':
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
          tag: callId,
          data: {
            id: callId,
            scope: this._scope,
          },
          body: `${callerName} ${phoneNumber}`,
          icon: '/icon/incomingCall.png',
        });
        break;

      case 'CLOSE':
        this.close(this._telephonyStore.callId);
        break;

      case 'DISPOSE':
        this.clear();
        break;

      default:
        break;
    }
  }
}

export { TelephonyNotificationManager };
