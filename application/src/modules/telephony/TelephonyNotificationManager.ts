/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 13:39:54
 * Copyright © RingCentral. All rights reserved.
 */

import { NotificationManager } from '@/modules/notification/manager';
import i18nT from '@/utils/i18nT';

type Action =
  | {
      type: 'SHOW';
      options: {
        id: string;
        callNumber: string;
        callerName: string;
        answerHandler?: () => void;
      };
    }
  | {
      type: 'CLOSE';
      options: {
        id: string;
      };
    }
  | {
      type: 'DISPOSE';
      options?: {};
    };

class TelephonyNotificationManager extends NotificationManager {
  constructor() {
    super('telephony');
  }

  async dispatch(action: Action) {
    switch (action.type) {
      case 'SHOW':
        const { id, answerHandler } = action.options;
        let { callNumber, callerName } = action.options;
        if (
          !callerName ||
          callerName === callNumber ||
          callNumber === 'anonymous'
        ) {
          callerName =
            (await i18nT('telephony.notification.unknownCaller')) ||
            'Unknown Caller';
        }
        callNumber =
          !callNumber || callNumber === 'anonymous' ? '' : callNumber;
        const title = await i18nT('telephony.notification.incomingCall');
        const actions = [];
        if (answerHandler) {
          actions.push({
            title: await i18nT('telephony.notification.answer'),
            icon: '',
            action: 'answer',
            handler: answerHandler,
          });
        }
        this.show(title, {
          actions,
          tag: `${id}`,
          data: {
            id,
            scope: this._scope,
          },
          body: `${callerName} ${callNumber}`,
          icon: '/icon/incomingCall.png',
        });
        break;

      case 'CLOSE':
        this.close(action.options.id);
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
