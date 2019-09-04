/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-07-21 16:15:51
 * Copyright © RingCentral. All rights reserved.
 */

import { CallSwitchController } from '../CallSwitchController';
import { TelephonyService } from '../../service';
import { RCInfoService } from 'sdk/module/rcInfo';
import {
  notificationCenter,
  SUBSCRIPTION,
  SERVICE,
  RC_INFO,
  ENTITY,
  EVENT_TYPES,
  WINDOW,
} from 'sdk/service';
import { AccountGlobalConfig } from 'sdk/module/account/config';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';
import { SettingService, SettingEntityIds } from 'sdk/module/setting';
import { CALLING_OPTIONS } from 'sdk/module/profile';
import _ from 'lodash';

jest.mock('../../service');
jest.mock('sdk/module/setting');
jest.mock('sdk/module/rcInfo');
jest.mock('sdk/service/notificationCenter');
jest.mock('../../service');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CallSwitchController', () => {
  let settingService: SettingService;
  let rcInfoService: RCInfoService;
  let callSwitchController: CallSwitchController;
  let telephonyService: TelephonyService;
  function setUp() {
    _.debounce = jest.fn().mockReturnValue(jest.fn());
    AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValue('1');
    settingService = new SettingService();
    rcInfoService = new RCInfoService();
    ServiceLoader.getInstance = jest.fn().mockImplementation((x: string) => {
      switch (x) {
        case ServiceConfig.RC_INFO_SERVICE:
          return rcInfoService;
        case ServiceConfig.SETTING_SERVICE:
          return settingService;
        default:
          return null;
      }
    });
    telephonyService = new TelephonyService();
    callSwitchController = new CallSwitchController(telephonyService);
  }

  function setPermission(params: {
    voip: boolean;
    callSwitch: boolean;
    webPhone: boolean;
    setting: boolean;
  }) {
    telephonyService.getVoipCallPermission = jest
      .fn()
      .mockResolvedValue(params.voip);
    rcInfoService.isRCFeaturePermissionEnabled = jest
      .fn()
      .mockImplementation((x: ERCServiceFeaturePermission) => {
        switch (x) {
          case ERCServiceFeaturePermission.CALL_SWITCH:
            return params.callSwitch;
          case ERCServiceFeaturePermission.WEB_PHONE:
            return params.webPhone;
          default:
            return false;
        }
      });

    settingService.getById = jest.fn().mockImplementation((id: number) => {
      switch (id) {
        case SettingEntityIds.Phone_DefaultApp:
          return {
            value: params.setting
              ? CALLING_OPTIONS.GLIP
              : CALLING_OPTIONS.RINGCENTRAL,
          };
        default:
          return undefined;
      }
    });
  }

  function setUpControllerMembers(p: {
    lastBannerStatus: boolean;
    activeCalls: any;
    sessionToSequence: any;
    endedCall?: any;
  }) {
    callSwitchController['_lastBannerIsShown'] = p.lastBannerStatus;
    callSwitchController['_currentActiveCalls'] = p.activeCalls;
    callSwitchController['_sessionToSequence'] = p.sessionToSequence;
    p.endedCall && (callSwitchController['_endedCalls'] = p.endedCall);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('start', () => {
    it('should start listen changes when can use call switch [JPT-2574]', async () => {
      setPermission({
        voip: true,
        callSwitch: true,
        webPhone: true,
        setting: true,
      });
      callSwitchController.handleTelephonyPresence = jest.fn();
      notificationCenter.on = jest.fn().mockImplementation((key, other) => {
        if (key === RC_INFO.RC_PRESENCE) {
          other(1);
          expect(
            callSwitchController.handleTelephonyPresence,
          ).toHaveBeenCalledWith(1, false);
        }
      });

      await callSwitchController.start();

      expect(notificationCenter.on).toHaveBeenCalledWith(
        SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
        callSwitchController['_checkSubscription'],
      );

      expect(notificationCenter.on).toHaveBeenCalledWith(
        RC_INFO.RC_PRESENCE,
        expect.any(Function),
      );

      expect(notificationCenter.on).toHaveBeenCalledWith(
        RC_INFO.EXTENSION_INFO,
        callSwitchController['_checkSubscription'],
      );

      expect(notificationCenter.on).toHaveBeenCalledWith(
        SUBSCRIPTION.PRESENCE_WITH_TELEPHONY_DETAIL,
        callSwitchController['handleTelephonyPresence'],
      );

      expect(notificationCenter.on).toHaveBeenCalledWith(
        ENTITY.CALL,
        callSwitchController['_handleCallStateChanged'],
      );

      expect(notificationCenter.on).toHaveBeenCalledWith(
        WINDOW.ONLINE,
        callSwitchController['_clearAndSyncRCPresence'],
      );

      expect(notificationCenter.on).toHaveBeenCalledWith(
        SERVICE.WAKE_UP_FROM_SLEEP,
        callSwitchController['_clearAndSyncRCPresence'],
      );

      expect(notificationCenter.on).toHaveBeenCalledWith(
        SERVICE.RC_EVENT_SUBSCRIPTION.SUBSCRIPTION_CONNECTED,
        callSwitchController['_handleRCSubscriptionConnected'],
      );
    });

    it.each`
      condition                                                           | result
      ${{ voip: false, callSwitch: true, webPhone: true, setting: true }} | ${false}
      ${{ voip: true, callSwitch: false, webPhone: true, setting: true }} | ${false}
      ${{ voip: true, callSwitch: true, webPhone: false, setting: true }} | ${false}
      ${{ voip: true, callSwitch: true, webPhone: true, setting: false }} | ${false}
    `('should stop listen changes when $condition', async ({ condition }) => {
      setPermission(condition);

      callSwitchController['_isSubscribe'] = true;

      await callSwitchController.start();
      expect(notificationCenter.on).toHaveBeenCalledWith(
        SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
        callSwitchController['_checkSubscription'],
      );

      expect(notificationCenter.on).toHaveBeenCalledWith(
        RC_INFO.EXTENSION_INFO,
        callSwitchController['_checkSubscription'],
      );

      expect(notificationCenter.on).not.toHaveBeenCalledWith(
        SUBSCRIPTION.PRESENCE_WITH_TELEPHONY_DETAIL,
        callSwitchController['handleTelephonyPresence'],
      );

      expect(notificationCenter.off).toHaveBeenCalledWith(
        SUBSCRIPTION.PRESENCE_WITH_TELEPHONY_DETAIL,
        callSwitchController['handleTelephonyPresence'],
      );
    });
  });

  describe('handleTelephonyPresence', () => {
    beforeEach(() => {
      setPermission({
        voip: true,
        callSwitch: true,
        webPhone: true,
        setting: true,
      });
      callSwitchController['_isSubscribe'] = true;
      telephonyService.getAllCallCount = jest.fn().mockReturnValue(0);
    });
    const defaultSequence = 100;
    const activeCall_1: any = {
      direction: 'Inbound',
      from: '108',
      fromName: 'John Snow',
      id: 'ac5219bca10b4bfc8835d91a1d25ffe9',
      partyId: 'Y3MxNzI2MjI1NTU1MjA4MTU2NDM5QDEwLjc0LjIuMjE5-2',
      sessionId: '5224474006',
      startTime: '2019-07-22T01:38:14.646Z',
      telephonySessionId: 'Y3MxNzI2MjI1NTU1MjA4MTU2NDM5QDEwLjc0LjIuMjE5',
      telephonyStatus: 'CallConnected',
      to: '109',
      toName: 'Cersei Lannister',
      sipData: {
        fromTag: 'f',
        toTag: 't',
      },
    };

    it('should not handle presence when extension id is not my', async () => {
      callSwitchController['_updateBannerStatus'] = jest.fn();
      const payLoad = { extensionId: 2 };
      callSwitchController.handleTelephonyPresence(payLoad as any, true);
      expect(
        callSwitchController['_updateBannerStatus'],
      ).not.toHaveBeenCalled();
    });

    it('should ignore extension id checking when is not from push', async () => {
      callSwitchController['_updateBannerStatus'] = jest.fn();
      const payLoad = { extensionId: 2 };
      callSwitchController.handleTelephonyPresence(payLoad as any, false);
      expect(callSwitchController['_updateBannerStatus']).toHaveBeenCalled();
    });

    it('should not handle presence when no sequence in push payload', async () => {
      callSwitchController['_updateBannerStatus'] = jest.fn();
      const payLoad = { extensionId: 1 };
      callSwitchController.handleTelephonyPresence(payLoad as any, true);
      expect(
        callSwitchController['_updateBannerStatus'],
      ).not.toHaveBeenCalled();
    });

    it('should handle presence when no sequence but not from push', async () => {
      callSwitchController['_updateBannerStatus'] = jest.fn();
      const payLoad = { extensionId: 1 };
      callSwitchController.handleTelephonyPresence(payLoad as any, false);
      expect(callSwitchController['_updateBannerStatus']).toHaveBeenCalled();
    });

    it('should record active call from the payload and notify listeners', async (done: any) => {
      const payLoad = {
        extensionId: 1,
        sequence: defaultSequence,
        activeCalls: [activeCall_1],
      } as any;
      callSwitchController.handleTelephonyPresence(payLoad, true);

      setTimeout(() => {
        expect(notificationCenter.emit).toHaveBeenCalledWith(
          SERVICE.TELEPHONY_SERVICE.CALL_SWITCH,
          true,
        );
        done();
      }, 10);
    });

    it('should delete call with smaller sequence', async (done: any) => {
      setUpControllerMembers({
        lastBannerStatus: true,
        activeCalls: [activeCall_1],
        sessionToSequence: [
          { sessionId: activeCall_1.sessionId, sequence: defaultSequence },
        ],
      });

      const payLoad = {
        extensionId: 1,
        sequence: defaultSequence - 1,
        activeCalls: [{ ...activeCall_1 }],
      } as any;

      callSwitchController.handleTelephonyPresence(payLoad, true);

      setTimeout(() => {
        expect(notificationCenter.emit).toHaveBeenCalledWith(
          SERVICE.TELEPHONY_SERVICE.CALL_SWITCH,
          false,
        );
        expect(callSwitchController['_currentActiveCalls']).toEqual([]);
        done();
      }, 10);
    });

    it('should delete call with call is ended before', async (done: any) => {
      // to do
      setUpControllerMembers({
        lastBannerStatus: true,
        activeCalls: [],
        sessionToSequence: [],
        endedCall: [
          {
            id: Date.now(),
            callId: activeCall_1.id,
            fromTag: activeCall_1.sipData.fromTag,
            toTag: activeCall_1.sipData.toTag,
          },
        ],
      });

      const payLoad = {
        extensionId: 1,
        sequence: defaultSequence + 1,
        activeCalls: [{ ...activeCall_1 }],
      } as any;

      callSwitchController.handleTelephonyPresence(payLoad, true);

      setTimeout(() => {
        expect(notificationCenter.emit).toHaveBeenCalledWith(
          SERVICE.TELEPHONY_SERVICE.CALL_SWITCH,
          false,
        );
        expect(callSwitchController['_currentActiveCalls']).toEqual([]);
        done();
      }, 10);
    });

    it('should delete active call from call list when call is ended', async (done: any) => {
      setUpControllerMembers({
        lastBannerStatus: true,
        activeCalls: [activeCall_1],
        sessionToSequence: [
          { sessionId: activeCall_1.sessionId, sequence: defaultSequence },
        ],
      });
      const payLoad = {
        extensionId: 1,
        sequence: defaultSequence + 1,
        activeCalls: [{ ...activeCall_1, telephonyStatus: 'NoCall' }],
      } as any;
      callSwitchController.handleTelephonyPresence(payLoad, true);

      setTimeout(() => {
        expect(notificationCenter.emit).toHaveBeenCalledWith(
          SERVICE.TELEPHONY_SERVICE.CALL_SWITCH,
          false,
        );
        expect(callSwitchController['_currentActiveCalls']).toEqual([]);
        done();
      }, 10);
    });

    it('should delete active call from call list when presence comes from non-push and no call in the plaLoad', async (done: any) => {
      setUpControllerMembers({
        lastBannerStatus: true,
        activeCalls: [activeCall_1],
        sessionToSequence: [
          { sessionId: activeCall_1.sessionId, sequence: defaultSequence },
        ],
      });
      const payLoad = {
        extensionId: 1,
        activeCalls: [],
      } as any;
      callSwitchController.handleTelephonyPresence(payLoad, false);

      setTimeout(() => {
        expect(notificationCenter.emit).toHaveBeenCalledWith(
          SERVICE.TELEPHONY_SERVICE.CALL_SWITCH,
          false,
        );
        expect(callSwitchController['_currentActiveCalls']).toEqual([]);
        done();
      }, 10);
    });

    it('should delete active call with smaller sequence', async (done: any) => {
      setUpControllerMembers({
        lastBannerStatus: true,
        activeCalls: [activeCall_1],
        sessionToSequence: [
          { sessionId: activeCall_1.sessionId, sequence: defaultSequence },
        ],
      });
      const payLoad = {
        extensionId: 1,
        activeCalls: [],
        sequence: defaultSequence + 1,
      } as any;
      callSwitchController.handleTelephonyPresence(payLoad, true);

      setTimeout(() => {
        expect(notificationCenter.emit).toHaveBeenCalledWith(
          SERVICE.TELEPHONY_SERVICE.CALL_SWITCH,
          false,
        );
        expect(callSwitchController['_currentActiveCalls']).toEqual([]);
        done();
      }, 10);
    });

    it('should not delete active call when incoming sequence is smaller', async (done: any) => {
      setUpControllerMembers({
        lastBannerStatus: true,
        activeCalls: [activeCall_1],
        sessionToSequence: [
          { sessionId: activeCall_1.sessionId, sequence: defaultSequence },
        ],
      });
      const payLoad = {
        extensionId: 1,
        activeCalls: [],
        sequence: defaultSequence - 1,
      } as any;
      callSwitchController.handleTelephonyPresence(payLoad, true);

      setTimeout(() => {
        expect(notificationCenter.emit).not.toHaveBeenCalled();
        expect(callSwitchController['_currentActiveCalls']).toEqual([
          activeCall_1,
        ]);
        done();
      }, 10);
    });
  });

  describe('_isCallDataValid', () => {
    it.each`
      call                                                                                                                                | result
      ${{ id: undefined }}                                                                                                                | ${false}
      ${{ id: '1', sessionId: undefined }}                                                                                                | ${false}
      ${{ id: '1', sessionId: '1' }}                                                                                                      | ${false}
      ${{ id: '1', sessionId: '1', telephonyStatus: undefined }}                                                                          | ${false}
      ${{ id: '1', sessionId: '1', telephonyStatus: 'CallConnected', direction: undefined }}                                              | ${false}
      ${{ id: '1', sessionId: '1', telephonyStatus: 'CallConnected', direction: 'Inbound', sipData: undefined }}                          | ${false}
      ${{ id: '1', sessionId: '1', telephonyStatus: 'CallConnected', direction: 'Inbound', sipData: { fromTag: undefined, toTag: 't' } }} | ${false}
      ${{ id: '1', sessionId: '1', telephonyStatus: 'CallConnected', direction: 'Inbound', sipData: { fromTag: 'f', toTag: undefined } }} | ${false}
      ${{ id: '1', sessionId: '1', telephonyStatus: 'Ringing', direction: 'Inbound', sipData: { fromTag: 'f', toTag: 't' } }}             | ${false}
      ${{ id: '1', sessionId: '1', telephonyStatus: 'Ringing', direction: 'Outbound', sipData: { fromTag: 'f', toTag: 't' } }}            | ${true}
      ${{ id: '1', sessionId: '1', telephonyStatus: 'CallConnected', direction: 'Inbound', sipData: { fromTag: 'f', toTag: 't' } }}       | ${true}
    `('should return $result when call is : $call ', ({ call, result }) => {
      expect(callSwitchController['_isCallDataValid'](call)).toEqual(result);
    });
  });

  describe('_shouldShowSwitchCall[JPT-2529]', () => {
    function setData(p: {
      activeCalls: any;
      allCallCnt: number;
      canUse: boolean;
    }) {
      callSwitchController['_currentActiveCalls'] = p.activeCalls;
      telephonyService.getAllCallCount = jest
        .fn()
        .mockReturnValue(p.allCallCnt);
      callSwitchController['_canUseCallSwitch'] = jest
        .fn()
        .mockResolvedValue(p.canUse);
    }

    it.each`
      condition                                                                   | result
      ${{ activeCalls: [{ id: '1' }, { id: '2' }], allCallCnt: 1, canUse: true }} | ${false}
      ${{ activeCalls: [{ id: '1' }], allCallCnt: 1, canUse: true }}              | ${false}
      ${{ activeCalls: [{ id: '1' }], allCallCnt: 0, canUse: false }}             | ${false}
      ${{ activeCalls: [{ id: '1' }], allCallCnt: 0, canUse: true }}              | ${true}
    `(
      'should show : $result when condition: $condition, [JPT-2567]',
      async ({ condition, result }) => {
        setData(condition);
        expect(await callSwitchController['_shouldShowSwitchCall']()).toEqual(
          result,
        );
      },
    );
  });

  describe('isSameCall', () => {
    it.each`
      callA                                        | callB                                         | result
      ${{ callId: '1' }}                           | ${{ callId: '2' }}                            | ${false}
      ${{ callId: '1', fromTag: 'f' }}             | ${{ callId: '1', fromTag: 'f1' }}             | ${false}
      ${{ callId: '1', fromTag: 'f', toTag: 't' }} | ${{ callId: '1', fromTag: 'f', toTag: 't1' }} | ${false}
      ${{ callId: '1', fromTag: 'f', toTag: 't' }} | ${{ callId: '1', fromTag: 'f', toTag: 't' }}  | ${true}
      ${{ callId: '1', fromTag: 't', toTag: 'f' }} | ${{ callId: '1', fromTag: 'f', toTag: 't' }}  | ${true}
    `('should be $result $callA and $callB ', ({ callA, callB, result }) => {
      expect(callSwitchController['_isSameCall'](callA, callB)).toEqual(result);
    });
  });

  describe('MAX_CALL_CACHE_CNT', () => {
    it('should cache at most MAX_CALL_CACHE_CNT sessions', () => {
      const preSetData = [];
      for (let i = 0; i < 30; i++) {
        preSetData.push({ sessionId: i.toString(), sequence: i });
      }

      callSwitchController['_sessionToSequence'] = preSetData;
      expect(callSwitchController['_sessionToSequence'].length).toEqual(30);
      expect(callSwitchController['_sessionToSequence'][0]).toEqual({
        sessionId: '0',
        sequence: 0,
      });

      callSwitchController['_cacheSession']('100', 100);
      expect(callSwitchController['_sessionToSequence'].length).toEqual(30);
      expect(callSwitchController['_sessionToSequence'][0]).toEqual({
        sessionId: '1',
        sequence: 1,
      });
    });

    const newCallLogData = {
      id: 100,
      callId: '100',
      fromTag: 'f',
      toTag: 't',
    };

    it('should cache at most MAX_CALL_CACHE_CNT ended calls', () => {
      const preSetData = [];
      for (let i = 0; i < 30; i++) {
        preSetData.push({
          id: i,
          callId: i.toString(),
          fromTag: 'f',
          toTag: 't',
        });
      }

      callSwitchController['_endedCalls'] = preSetData;
      expect(callSwitchController['_endedCalls'].length).toEqual(30);
      expect(callSwitchController['_endedCalls'][0]).toEqual({
        id: 0,
        callId: '0',
        fromTag: 'f',
        toTag: 't',
      });

      callSwitchController['_recordEndedCalls'](newCallLogData);
      expect(callSwitchController['_endedCalls'].length).toEqual(30);
      expect(callSwitchController['_endedCalls'][0]).toEqual({
        id: 1,
        callId: '1',
        fromTag: 'f',
        toTag: 't',
      });
    });

    it('should not record duplicated call log', () => {
      expect(callSwitchController['_endedCalls'].length).toEqual(0);
      callSwitchController['_recordEndedCalls'](newCallLogData);
      expect(callSwitchController['_endedCalls'].length).toEqual(1);
      callSwitchController['_recordEndedCalls'](newCallLogData);
      expect(callSwitchController['_endedCalls'].length).toEqual(1);
    });
  });

  describe('onCallEnded', () => {
    it('should record ended call', async () => {
      const callEntity = {
        id: 1,
        call_id: '1',
        from_tag: 'f',
        to_tag: 't',
      };
      setUpControllerMembers({
        lastBannerStatus: true,
        activeCalls: [
          {
            id: '1',
            sipData: {
              fromTag: 'f',
              toTag: 't',
            },
          },
        ],
        sessionToSequence: [],
      });

      telephonyService.getById = jest.fn().mockResolvedValue(callEntity);
      await callSwitchController['_onCallEnded'](callEntity as any);
      expect(callSwitchController['_endedCalls'].length).toEqual(1);
      expect(callSwitchController['_currentActiveCalls'].length).toEqual(0);
    });

    it('should not record ended call when call data is incomplete', async () => {
      const callEntity = {
        id: 1,
        call_state: 'connected',
        call_id: '1',
        to_tag: 't',
      };

      await callSwitchController['_onCallEnded'](callEntity as any);
      expect(callSwitchController['_endedCalls'].length).toEqual(0);
    });
  });

  describe('_handleCallStateChanged', () => {
    it('should only handle update type and save ended calls', () => {
      callSwitchController['_syncLatestPresenceAfterCallEnd'] = jest.fn();
      (callSwitchController[
        '_syncLatestPresenceAfterCallEnd'
      ] as any) = jest.fn();
      callSwitchController['_onCallEnded'] = jest.fn();
      callSwitchController['_updateBannerStatus'] = jest.fn();
      const payLoad: any = {
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: new Map([
            [
              1,
              {
                call_state: 'Connected',
                call_id: '1',
                from_tag: 'f',
                to_tag: 't',
              },
            ],
            [
              2,
              {
                call_state: 'Disconnecting',
                call_id: '1',
                from_tag: 'f',
                to_tag: 't',
              },
            ],
          ]),
        },
      };

      callSwitchController['_handleCallStateChanged'](payLoad);
      expect(callSwitchController['_updateBannerStatus']).toHaveBeenCalled();
      expect(callSwitchController['_onCallEnded']).toHaveBeenCalledWith({
        call_id: '1',
        call_state: 'Disconnecting',
        from_tag: 'f',
        to_tag: 't',
      });
      expect(
        callSwitchController['_syncLatestPresenceAfterCallEnd'],
      ).toHaveBeenCalled();
    });

    it('should trigger sync rc presence with 5s delay and should not throw error', async () => {
      rcInfoService.syncUserRCPresence = jest.fn();

      _.debounce = jest.fn().mockImplementation((fn, delay, options) => {
        return async () => {
          await fn();
        };
      });

      callSwitchController['_lastBannerIsShown'] = true;
      callSwitchController['_syncRCPresenceTimer'] = { id: 1 } as any;

      rcInfoService.syncUserRCPresence = jest
        .fn()
        .mockRejectedValue(new Error());
      callSwitchController = new CallSwitchController(telephonyService);
      await callSwitchController['_syncLatestPresenceAfterCallEnd']();
      expect(rcInfoService.syncUserRCPresence).toHaveBeenCalled();
    });

    it('should clear active calls when has banner', () => {
      callSwitchController['_currentActiveCalls'] = [{ id: 1 }] as any;
      callSwitchController['_lastBannerIsShown'] = true;
      callSwitchController['_clearAndSyncRCPresence']();
      expect(callSwitchController['_currentActiveCalls']).toEqual([]);
    });
  });

  describe('_handleRCSubscriptionConnected', () => {
    it('should only request rc presence with debounce when has banner and PubNub connected', async () => {
      callSwitchController['_lastBannerIsShown'] = true;
      (callSwitchController[
        '_syncLatestUserPresenceDebounce'
      ] as any) = jest.fn();
      await callSwitchController['_handleRCSubscriptionConnected']();
      expect(
        callSwitchController['_syncLatestUserPresenceDebounce'],
      ).toHaveBeenCalled();
    });

    it('should not request rc presence when no banner and PubNub connected', async () => {
      callSwitchController['_lastBannerIsShown'] = false;
      (callSwitchController[
        '_syncLatestUserPresenceDebounce'
      ] as any) = jest.fn();
      await callSwitchController['_handleRCSubscriptionConnected']();
      expect(
        callSwitchController['_syncLatestUserPresenceDebounce'],
      ).not.toHaveBeenCalled();
    });
  });
});
