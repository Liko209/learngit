/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-06-21 13:53:18
 * Copyright © RingCentral. All rights reserved.
 */

import { getCurrentTime } from '../../../utils/jsUtils';
import { GroupTyping } from '../entity/Group';
import GroupAPI from '../../../api/glip/group';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE } from '../../../service/eventKey';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { AccountService } from '../../account';
import { mainLogger } from 'foundation/log';

type GroupTypingParams = {
  group_id: number;
  clear?: boolean;
};

type TimeFlagMapValue = {
  lastTypingTime: number;
  lastClearTime: number;
};

const MINI_TYPING_INTERVAL = 5000;
const CACHE_SIZE = 5;

class TypingIndicatorController {
  private timeFlagMap: Map<number, TimeFlagMapValue> = new Map();
  constructor() {}

  async sendTypingEvent(groupId: number, isClear: boolean) {
    if (this._longEnoughToSend(groupId, isClear)) {
      // send data
      const options: GroupTypingParams = {
        group_id: groupId,
      };
      if (isClear) {
        options.clear = isClear;
      }
      try {
        await GroupAPI.sendTypingEvent(options);
      } catch (e) {
        mainLogger.log('send typing error:', e);
      }

      // update time flag
      this._updateTimeFlag(groupId, isClear);
      return true;
    }
    return false;
  }

  handleIncomingTyingEvent(groupTyping: GroupTyping) {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const currentUserId = userConfig.getGlipUserId() as number;
    currentUserId !== groupTyping.user_id &&
      notificationCenter.emit(SERVICE.GROUP_TYPING, groupTyping);
  }

  private _longEnoughToSend(groupId: number, isClear: boolean) {
    const flag = this.timeFlagMap.get(groupId);
    if (flag) {
      const lastTime = isClear ? flag.lastClearTime : flag.lastTypingTime;
      return getCurrentTime() - lastTime >= MINI_TYPING_INTERVAL;
    }
    return true;
  }

  private _updateTimeFlag(groupId: number, isClear: boolean) {
    const now = getCurrentTime();
    const value = this.timeFlagMap.get(groupId);
    if (value) {
      this.timeFlagMap.set(groupId, {
        lastClearTime: isClear ? now : value.lastClearTime,
        lastTypingTime: isClear ? value.lastTypingTime : now,
      });
    } else {
      if (this.timeFlagMap.size >= CACHE_SIZE) {
        // remove the oldest one
        this._removeOldestData();
      }
      this.timeFlagMap.set(groupId, {
        lastClearTime: now,
        lastTypingTime: now,
      });
    }
  }

  private _removeOldestData() {
    let oldestTime = Number.MAX_SAFE_INTEGER;
    let groupId = 0;
    this.timeFlagMap.forEach((value: TimeFlagMapValue, key: number) => {
      if (value.lastTypingTime < oldestTime) {
        groupId = key;
        oldestTime = value.lastTypingTime;
      }
    });

    this.timeFlagMap.delete(groupId);
  }
}

export { TypingIndicatorController, TimeFlagMapValue };
