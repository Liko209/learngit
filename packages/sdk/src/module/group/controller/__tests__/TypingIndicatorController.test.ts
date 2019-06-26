/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-06-21 15:22:30
 * Copyright © RingCentral. All rights reserved.
 */

import { getCurrentTime } from '../../../../utils/jsUtils';
import GroupAPI from '../../../../api/glip/group';
import notificationCenter from '../../../../service/notificationCenter';
import { ServiceLoader } from '../../../serviceLoader';
import { AccountService } from '../../../../module/account';
import {
  TypingIndicatorController,
  TimeFlagMapValue,
} from '../TypingIndicatorController';

jest.mock('../../../../service/notificationCenter');
jest.mock('../../../../api/glip/group');
jest.mock('../../../../utils/jsUtils');
jest.mock('../../../../api/glip/group');

const MINI_TYPING_INTERVAL = 5000;
const MINI_TYPING_INTERVAL_ADD_1 = MINI_TYPING_INTERVAL + 1;
const MINI_TYPING_INTERVAL_MINUS_1 = MINI_TYPING_INTERVAL - 1;
const LAST_TIME = 20000;

let accountService: AccountService;

describe('TypingIndicatorController', () => {
  beforeEach(() => {
    accountService = {
      // @ts-ignore
      userConfig: {
        getGlipUserId: jest.fn(),
      },
    };
    ServiceLoader.getInstance = jest.fn().mockReturnValue(accountService);
    GroupAPI.sendTypingEvent.mockReturnValueOnce('');
  });
  describe('sendTypingEvent', () => {
    describe('_longEnoughToSend', () => {
      it('should return true if this group has never been typed - 1', () => {
        const controller = new TypingIndicatorController();
        expect(controller['_longEnoughToSend'](10, false)).toBeTruthy();
      });
      it('should return true if this group has never been typed - 2', () => {
        const controller = new TypingIndicatorController();
        expect(controller['_longEnoughToSend'](10, true)).toBeTruthy();
      });
      it('should return true when user is typing and the interval time is larger than 5s', () => {
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [10, { lastTypingTime: LAST_TIME, lastClearTime: LAST_TIME }],
        ]);
        getCurrentTime.mockReturnValueOnce(
          LAST_TIME + MINI_TYPING_INTERVAL_ADD_1,
        );
        expect(controller['_longEnoughToSend'](10, false)).toBeTruthy();
      });
      it('should return false when user is typing and the interval time is less than 5s', () => {
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [10, { lastTypingTime: LAST_TIME, lastClearTime: LAST_TIME }],
        ]);
        getCurrentTime.mockReturnValueOnce(
          LAST_TIME + MINI_TYPING_INTERVAL_MINUS_1,
        );
        expect(controller['_longEnoughToSend'](10, false)).toBeFalsy();
      });
      it('should return true when user clear data and the interval time is larger than 5s', () => {
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [10, { lastTypingTime: LAST_TIME, lastClearTime: LAST_TIME }],
        ]);
        getCurrentTime.mockReturnValueOnce(
          LAST_TIME + MINI_TYPING_INTERVAL_ADD_1,
        );
        expect(controller['_longEnoughToSend'](10, true)).toBeTruthy();
      });
      it('should return false when user clear data  and the interval time is less than 5s', () => {
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [10, { lastTypingTime: LAST_TIME, lastClearTime: LAST_TIME }],
        ]);
        getCurrentTime.mockReturnValueOnce(
          LAST_TIME + MINI_TYPING_INTERVAL_MINUS_1,
        );
        expect(controller['_longEnoughToSend'](10, true)).toBeFalsy();
      });
    });
    describe('_updateTimeFlag', () => {
      it('should update directly when it is the first time user typing', () => {
        const controller = new TypingIndicatorController();
        let map = controller['timeFlagMap'] as Map<number, TimeFlagMapValue>;
        expect(map.get(10)).toBeUndefined();

        getCurrentTime.mockReturnValueOnce(LAST_TIME);
        controller['_updateTimeFlag'](10, false);
        map = controller['timeFlagMap'] as Map<number, TimeFlagMapValue>;
        expect(map.get(10)).toEqual({
          lastClearTime: LAST_TIME,
          lastTypingTime: LAST_TIME,
        });
      });
      it('should only update clear time when group already has cache value and is clear event', () => {
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [
            10,
            {
              lastClearTime: LAST_TIME,
              lastTypingTime: LAST_TIME,
            },
          ],
        ]);

        getCurrentTime.mockReturnValueOnce(LAST_TIME + 1);
        controller['_updateTimeFlag'](10, true);
        const map = controller['timeFlagMap'] as Map<number, TimeFlagMapValue>;
        expect(map.get(10)).toEqual({
          lastClearTime: LAST_TIME + 1,
          lastTypingTime: LAST_TIME,
        });
      });
      it('should only update typing time when group already has cache value and is typing event', () => {
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [
            10,
            {
              lastClearTime: LAST_TIME,
              lastTypingTime: LAST_TIME,
            },
          ],
        ]);

        getCurrentTime.mockReturnValueOnce(LAST_TIME + 1);
        controller['_updateTimeFlag'](10, false);
        const map = controller['timeFlagMap'] as Map<number, TimeFlagMapValue>;
        expect(map.get(10)).toEqual({
          lastClearTime: LAST_TIME,
          lastTypingTime: LAST_TIME + 1,
        });
      });

      it('should remove the oldest cache when cache has over threshold', () => {
        const value = {
          lastClearTime: LAST_TIME,
          lastTypingTime: LAST_TIME,
        };
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [1, value],
          [2, value],
          [
            3,
            {
              lastClearTime: LAST_TIME,
              lastTypingTime: LAST_TIME - 1,
            },
          ],
          [4, value],
          [5, value],
        ]);

        controller['_updateTimeFlag'](10, false);
        const map = controller['timeFlagMap'] as Map<number, TimeFlagMapValue>;
        expect([...map.keys()]).toEqual([1, 2, 4, 5, 10]);
      });
    });
    describe('sendTypingEvent', () => {
      it('should return false when it is not long enough to send typing event', () => {
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [10, { lastTypingTime: LAST_TIME, lastClearTime: LAST_TIME }],
        ]);
        getCurrentTime.mockReturnValue(
          LAST_TIME + MINI_TYPING_INTERVAL_MINUS_1,
        );
        expect(controller.sendTypingEvent(10, false)).toBeFalsy();
      });
      it('should return false when it is not long enough to send clear event', () => {
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [10, { lastTypingTime: LAST_TIME, lastClearTime: LAST_TIME }],
        ]);
        getCurrentTime.mockReturnValue(
          LAST_TIME + MINI_TYPING_INTERVAL_MINUS_1,
        );
        expect(controller.sendTypingEvent(10, true)).toBeFalsy();
      });
      it('should return true when it is long enough to send typing event', () => {
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [10, { lastTypingTime: LAST_TIME, lastClearTime: LAST_TIME }],
        ]);
        getCurrentTime.mockReturnValue(LAST_TIME + MINI_TYPING_INTERVAL_ADD_1);
        expect(controller.sendTypingEvent(10, false)).toBeTruthy();
      });
      it('should return true when it is long enough to send clear event', () => {
        const controller = new TypingIndicatorController();
        controller['timeFlagMap'] = new Map([
          [10, { lastTypingTime: LAST_TIME, lastClearTime: LAST_TIME }],
        ]);
        getCurrentTime.mockReturnValue(LAST_TIME + MINI_TYPING_INTERVAL_ADD_1);
        expect(controller.sendTypingEvent(10, true)).toBeTruthy();
      });
    });
  });

  describe('handleIncomingTyingEvent', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should notifiy UI if the data is not self', () => {
      const controller = new TypingIndicatorController();
      accountService['userConfig']['getGlipUserId'].mockReturnValue(10);
      const value = {
        group_id: 10,
        user_id: 4,
      };
      controller.handleIncomingTyingEvent(value);
      expect(notificationCenter.emit).toHaveBeenCalledWith(
        'SERVICE.GROUP_TYPING',
        value,
      );
    });
    it('should not notifiy UI if the data is self', () => {
      const controller = new TypingIndicatorController();
      accountService.userConfig.getGlipUserId.mockReturnValue(4);
      const value = {
        group_id: 10,
        user_id: 4,
      };
      controller.handleIncomingTyingEvent(value);
      expect(notificationCenter.emit).not.toHaveBeenCalled();
    });
  });
});
