/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 13:39:54
 * Copyright © RingCentral. All rights reserved.
 */

import { NotificationManager } from '@/modules/notification/manager';
import i18nT from '@/utils/i18nT';
import incomingCallIcon from './images/incoming-call.png';

type Action =
  | {
      type: 'INCOMING';
      options: {
        id: number;
        callNumber: string;
        callerName: string;
        answerHandler?: () => void;
      };
    }
  | {
      type: 'HANGUP';
      options: {
        id: number;
      };
    }
  | {
      type: 'DESTROY';
      options?: {};
    };

class TelephonyNotificationManager extends NotificationManager {
  constructor() {
    super('telephony');
  }

  async dispatch(action: Action) {
    switch (action.type) {
      case 'INCOMING':
        const { id, callNumber, callerName, answerHandler } = action.options;
        const title = await i18nT('telephony.notification.incomingCall');
        const answerAction = answerHandler
          ? {
              title: await i18nT('telephony.notification.answer'),
              icon: '',
              action: 'answer',
              handler: answerHandler,
            }
          : null;

        this.show(title, {
          actions: answerAction ? [answerAction] : [],
          tag: `${id}`,
          data: {
            id,
            scope: this._scope,
          },
          body: `${callerName} ${callNumber}`,
          icon: incomingCallIcon,
        });
        break;

      case 'HANGUP':
        this.close(action.options.id);
        break;

      case 'DESTROY':
        this.clear();
        break;

      default:
        break;
    }
  }
}

export { TelephonyNotificationManager };
