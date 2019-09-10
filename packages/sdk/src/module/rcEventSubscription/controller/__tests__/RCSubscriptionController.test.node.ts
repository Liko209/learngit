/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-30 21:44:29
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { RCSubscriptionController } from '../RCSubscriptionController';
import { RCEventSubscriptionConfig } from '../../config';
import { AccountGlobalConfig } from 'sdk/module/account/config';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { notificationCenter, SERVICE } from 'sdk/service';
import { RCInfoService } from 'sdk/module/rcInfo';
import { RcSubscriptionApi } from 'sdk/api/ringcentral/RcSubscriptionApi';
import { jobScheduler } from 'sdk/framework/utils/jobSchedule';
import Pubnub from 'pubnub';
import { mainLogger } from 'foundation/log';
import { PNCategories } from '../types';

jest.mock('sdk/framework/utils/jobSchedule');
jest.mock('sdk/api/ringcentral/RcSubscriptionApi');
jest.mock('sdk/module/rcInfo');
jest.mock('sdk/service');
jest.mock('sdk/module/serviceLoader');
jest.mock('sdk/module/account/config');
jest.mock('../../config');
jest.mock('pubnub', () => {
  const mock = {
    stop: jest.fn(),
    unsubscribeAll: jest.fn(),
    addListener: jest.fn(),
    subscribe: jest.fn(),
    decrypt: jest.fn(),
  };
  return () => mock;
});

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCSubscriptionController', () => {
  const userID = 999;
  let rcInfoService: RCInfoService;
  let rcSubscriptionController: RCSubscriptionController;
  let userConfig: RCEventSubscriptionConfig;
  let pubNub: any;
  const subscriptionInfo = {
    uri:
      'https://api-mucc.ringcentral.com/restapi/v1.0/subscription/776482e1-abaf-4afd-8067-26ece5996c3e',
    id: '776482e1-abaf-4afd-8067-26ece5996c3e',
    eventFilters: [
      '/restapi/v1.0/account/37439510/extension/1428352020/message-store',
      '/restapi/v1.0/account/37439510/extension/1428352020/missed-calls',
      '/restapi/v1.0/account/37439510/extension/1428352020/voicemail',
      '/restapi/v1.0/account/37439510/extension/1428352020/presence?detailedTelephonyState=true&sipData=true',
    ],
    expirationTime: '2999-06-30T01:03:22.973Z',
    expiresIn: 2591999,
    status: 'Active',
    creationTime: '2019-05-31T01:03:22.973Z',
    deliveryMode: {
      subscriberKey: 'subscriberKey',
      address: 'address',
      transportType: 'PubNub',
      encryption: true,
      encryptionAlgorithm: 'AES',
      encryptionKey: '78FWc+53DRNCYpGWWwzDxA==',
    },
  };

  function setUp(online = true) {
    pubNub = new Pubnub({ subscribeKey: '123' });
    rcInfoService = new RCInfoService();
    userConfig = new RCEventSubscriptionConfig();
    rcSubscriptionController = new RCSubscriptionController(userConfig);
    ServiceLoader.getInstance = jest.fn().mockImplementation((name: string) => {
      return rcInfoService;
    });
    AccountGlobalConfig.getUserDictionary = jest
      .fn()
      .mockReturnValue(userID.toString());

    notificationCenter.on = jest.fn();
    userConfig.getRcEventSubscription = jest
      .fn()
      .mockResolvedValue(subscriptionInfo);
    rcInfoService.isVoipCallingAvailable = jest.fn().mockResolvedValue(true);
    jobScheduler.scheduleAndIgnoreFirstTime = jest.fn();
    jobScheduler.scheduleJob = jest.fn();
    mainLogger.tags = jest.fn().mockImplementation(() => {
      return { log: () => {} };
    });

    Object.defineProperty(navigator, 'onLine', {
      value: online,
    });
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('startSubscription', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      rcSubscriptionController['_initStatus'] = 0;
    });

    it('should create new subscription and start pubnub when old subscription expired', async (done: any) => {
      rcSubscriptionController['_pubNub'] = pubNub;
      rcSubscriptionController['_initStatus'] = 0;
      const expiredSubscription = {
        ...subscriptionInfo,
        expirationTime: '1999-06-30T01:03:22.973Z',
        expiresIn: 1,
        status: 'Active',
        creationTime: '1019-05-31T01:03:22.973Z',
      };
      rcSubscriptionController['_pubNubChanel'] = {
        address: 'adr',
        subscriberKey: ' s key',
      };
      userConfig.getRcEventSubscription = jest
        .fn()
        .mockResolvedValue(expiredSubscription);

      RcSubscriptionApi.createSubscription = jest
        .fn()
        .mockResolvedValue(subscriptionInfo);

      await rcSubscriptionController.startSubscription();
      setTimeout(() => {
        expect(pubNub.addListener).toHaveBeenCalledWith({
          message: rcSubscriptionController['_notifyMessages'],
          status: rcSubscriptionController['_notifyStatus'],
        });
        expect(pubNub.subscribe).toHaveBeenCalledWith({
          channels: ['address'],
        });
        expect(userConfig.setRcEventSubscription).toHaveBeenCalledWith(
          subscriptionInfo,
        );

        done();
      });
    });

    it('should just return when is initializing', async (done: any) => {
      rcSubscriptionController['_initStatus'] = 1;
      rcSubscriptionController['_hasValidSubscriptionInfo'] = jest.fn();
      await rcSubscriptionController.startSubscription();
      setTimeout(() => {
        expect(
          rcSubscriptionController['_hasValidSubscriptionInfo'],
        ).not.toHaveBeenCalled();
        done();
      });
      expect.assertions(1);
    });

    it('should just subscribe when subscribe is alive and do not need update', async (done: any) => {
      await rcSubscriptionController.startSubscription();
      setTimeout(() => {
        expect(
          rcSubscriptionController['_pubNub'].addListener,
        ).toHaveBeenCalledWith({
          message: expect.any(Function),
          status: expect.any(Function),
        });
        expect(
          rcSubscriptionController['_pubNub'].subscribe,
        ).toHaveBeenCalledWith({
          channels: ['address'],
        });
        expect(RcSubscriptionApi.createSubscription).not.toHaveBeenCalled();
        expect(RcSubscriptionApi.updateSubscription).not.toHaveBeenCalled();
        expect(jobScheduler.scheduleAndIgnoreFirstTime).not.toHaveBeenCalled();
        expect(jobScheduler.scheduleJob).toHaveBeenCalled();
        done();
      });
      expect.assertions(6);
    });

    it('should pause subscribe when error happened', async (done: any) => {
      rcSubscriptionController['_startPubNub'] = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('error');
        });
      await rcSubscriptionController.startSubscription();
      setTimeout(() => {
        expect(jobScheduler.cancelJob).toHaveBeenCalled();
        expect(notificationCenter.once).toHaveBeenCalled();
        done();
      });
      expect.assertions(2);
    });

    it('should update subscribe when new subscription has new events', async (done: any) => {
      rcSubscriptionController['_initStatus'] = 0;
      const newSub = _.cloneDeep(subscriptionInfo);
      newSub.eventFilters = ['111', '222'];
      userConfig.getRcEventSubscription = jest.fn().mockResolvedValue(newSub);

      const newResponse = {
        ...newSub,
        expirationTime: '3999-06-30T01:03:22.973Z',
      };
      RcSubscriptionApi.updateSubscription = jest
        .fn()
        .mockResolvedValue(newResponse);
      rcSubscriptionController['_pubNubChanel'] = {
        address: 'adr',
        subscriberKey: ' s key',
      };
      await rcSubscriptionController.startSubscription();
      setTimeout(() => {
        expect(userConfig.setRcEventSubscription).toHaveBeenCalledWith(
          newResponse,
        );
        expect(
          rcSubscriptionController['_pubNub'].addListener,
        ).toHaveBeenCalledWith({
          message: expect.any(Function),
          status: expect.any(Function),
        });
        expect(
          rcSubscriptionController['_pubNub'].subscribe,
        ).toHaveBeenCalledWith({
          channels: ['address'],
        });
        expect(RcSubscriptionApi.createSubscription).not.toHaveBeenCalled();
        expect(RcSubscriptionApi.updateSubscription).toHaveBeenCalledWith(
          '776482e1-abaf-4afd-8067-26ece5996c3e',
          {
            deliveryMode: { encryption: true, transportType: 'PubNub' },
            eventFilters: [
              '/restapi/v1.0/account/~/extension/~/message-store',
              '/restapi/v1.0/account/~/extension/~/missed-calls',
              '/restapi/v1.0/account/~/extension/~/presence?detailedTelephonyState=true&sipData=true',
              '/restapi/v1.0/account/~/extension/~/voicemail',
            ],
          },
        );
        done();
      });
      expect.assertions(5);
    });

    it('should stop subscription when can not do subscription', async (done: any) => {
      rcInfoService.isVoipCallingAvailable = jest.fn().mockResolvedValue(false);
      rcSubscriptionController['_lastSubscription'] = subscriptionInfo as any;
      rcSubscriptionController['cleanUpSubscription'] = jest.fn();
      await rcSubscriptionController.startSubscription();
      setTimeout(() => {
        expect(
          rcSubscriptionController['cleanUpSubscription'],
        ).toHaveBeenCalled();
        done();
      });
    });

    it('should create subscribe when no subscription before', async (done: any) => {
      userConfig.getRcEventSubscription = jest.fn();
      RcSubscriptionApi.createSubscription = jest
        .fn()
        .mockResolvedValue(subscriptionInfo);

      await rcSubscriptionController.startSubscription();
      setTimeout(() => {
        expect(userConfig.setRcEventSubscription).toHaveBeenCalled();
        expect(
          rcSubscriptionController['_pubNub'].addListener,
        ).toHaveBeenCalledWith({
          message: expect.any(Function),
          status: expect.any(Function),
        });
        expect(
          rcSubscriptionController['_pubNub'].subscribe,
        ).toHaveBeenCalledWith({
          channels: ['address'],
        });
        expect(RcSubscriptionApi.createSubscription).toHaveBeenCalledWith({
          deliveryMode: { encryption: true, transportType: 'PubNub' },
          eventFilters: [
            '/restapi/v1.0/account/~/extension/~/presence?detailedTelephonyState=true&sipData=true',
            '/restapi/v1.0/account/~/extension/~/message-store',
            '/restapi/v1.0/account/~/extension/~/missed-calls',
            '/restapi/v1.0/account/~/extension/~/voicemail',
          ],
        });
        expect(RcSubscriptionApi.updateSubscription).not.toHaveBeenCalled();
        done();
      });
      expect.assertions(5);
    });
  });

  describe('_renewSubscription', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should not renew when no subscription info', async () => {
      jobScheduler.cancelJob = jest.fn();
      rcSubscriptionController['_lastSubscription'] = undefined as any;
      rcSubscriptionController['_startPubNub'] = jest.fn();
      await rcSubscriptionController['_renewSubscription']();
      expect(jobScheduler.cancelJob).toHaveBeenCalledWith(
        'RC_RENEW_SUBSCRIPTION',
      );
      expect(rcSubscriptionController['_startPubNub']).not.toHaveBeenCalled();
    });

    it('should renew when subscription is going to expired', async () => {
      rcSubscriptionController['_startPubNub'] = jest.fn();
      rcSubscriptionController['_lastSubscription'] = subscriptionInfo as any;
      const newInfo = {
        ...subscriptionInfo,
        expirationTime: '3999-06-30T01:03:22.973Z',
      };
      RcSubscriptionApi.renewSubscription.mockResolvedValue(newInfo);
      await rcSubscriptionController['_renewSubscription']();
      expect(RcSubscriptionApi.renewSubscription).toHaveBeenCalledWith(
        subscriptionInfo.id,
      );
      expect(userConfig.setRcEventSubscription).toHaveBeenCalledWith(newInfo);
      expect(rcSubscriptionController['_startPubNub']).toHaveBeenCalled();
    });

    it('should start new pubnub when subscription expired', async () => {
      rcSubscriptionController['_startSubscription'] = jest.fn();
      rcSubscriptionController['_lastSubscription'] = subscriptionInfo as any;
      rcSubscriptionController[
        '_isSubscriptionAlive'
      ] = jest.fn().mockReturnValue(false);

      await rcSubscriptionController['_renewSubscription']();
      expect(rcSubscriptionController['_startSubscription']).toHaveBeenCalled();
    });

    it('should pause subscription when renew subscription has error ', async () => {
      rcSubscriptionController['_lastSubscription'] = subscriptionInfo as any;

      RcSubscriptionApi.renewSubscription = jest
        .fn()
        .mockRejectedValue(new Error());
      await rcSubscriptionController['_renewSubscription']();
      expect(jobScheduler.cancelJob).toHaveBeenCalled();
      expect(notificationCenter.once).toHaveBeenCalled();
    });
  });

  describe('_notifyStatus', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should print log when call _notifyStatus', () => {
      rcSubscriptionController['_notifyStatus']({} as any);
      expect(mainLogger.tags).toHaveBeenCalled();
    });

    it.each`
      status                                                              | result
      ${{ category: PNCategories.PNConnectedCategory }}                   | ${true}
      ${{ category: PNCategories.PNReconnectedCategory }}                 | ${true}
      ${{ error: true, category: PNCategories.PNReconnectedCategory }}    | ${false}
      ${{ category: PNCategories.PNAccessDeniedCategory }}                | ${false}
      ${{ category: PNCategories.PNBadRequestCategory }}                  | ${false}
      ${{ category: PNCategories.PNNetworkDownCategory }}                 | ${false}
      ${{ category: PNCategories.PNNetworkIssuesCategory }}               | ${false}
      ${{ category: PNCategories.PNNetworkUpCategory }}                   | ${false}
      ${{ category: PNCategories.PNRequestMessageCountExceededCategory }} | ${false}
      ${{ category: PNCategories.PNTimeoutCategory }}                     | ${false}
      ${{ category: PNCategories.PNUnknownCategory }}                     | ${false}
    `('should notify $result when receive $status', ({ status, result }) => {
      rcSubscriptionController['_notifyStatus'](status as any);
      if (result) {
        expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
          SERVICE.RC_EVENT_SUBSCRIPTION.SUBSCRIPTION_CONNECTED,
          true,
        );
      } else {
        expect(notificationCenter.emitKVChange).not.toHaveBeenCalled();
      }
    });
  });

  describe('_notifyMessages', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return when no valid message', () => {
      rcSubscriptionController['_lastSubscription'] = subscriptionInfo as any;
      const payLoad = {
        message: undefined,
      };
      rcSubscriptionController['_dispatchMessages'] = jest.fn();
      rcSubscriptionController['_notifyMessages'](payLoad);
      expect(
        rcSubscriptionController['_dispatchMessages'],
      ).not.toHaveBeenCalled();
    });

    it('should return when can not get event message', () => {
      rcSubscriptionController['_pubNub'] = new Pubnub({} as any);
      rcSubscriptionController[
        '_pubNub'
      ].decrypt = jest.fn().mockImplementation((val1, val2, val3) => {
        return undefined;
      });

      rcSubscriptionController['_lastSubscription'] = subscriptionInfo as any;
      const payLoad = {
        message: {
          body: {
            activeCalls: [],
          },
          event:
            '/restapi/v1.0/account/131451006/extension/131453006/presence?detailedTelephonyState=true&sipData=true',
        },
      };
      rcSubscriptionController['_notifyMessages'](payLoad);
      expect(notificationCenter.emitKVChange).not.toHaveBeenCalled();
    });

    it('should dispatch messages when receive messages', () => {
      rcSubscriptionController['_pubNub'] = new Pubnub({} as any);
      rcSubscriptionController[
        '_pubNub'
      ].decrypt = jest.fn().mockImplementation((val1, val2, val3) => {
        return val1;
      });

      rcSubscriptionController['_lastSubscription'] = subscriptionInfo as any;
      const payLoad = {
        message: {
          body: {
            activeCalls: [],
          },
          event:
            '/restapi/v1.0/account/131451006/extension/131453006/presence?detailedTelephonyState=true&sipData=true',
        },
      };
      rcSubscriptionController['_notifyMessages'](payLoad);
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
        'SUBSCRIPTION.PRESENCE_WITH_TELEPHONY_DETAIL',
        payLoad.message.body,
      );
    });
  });

  describe('cleanUpSubscription', () => {
    const pubNub = new Pubnub({} as any);
    beforeEach(() => {
      clearMocks();
      setUp();
      rcSubscriptionController['_pubNub'] = pubNub;
      rcSubscriptionController['_lastSubscription'] = subscriptionInfo as any;
    });

    it('should clean job, pubnub, user config when clean up all subscription', async () => {
      await rcSubscriptionController.cleanUpSubscription();
      expect(rcSubscriptionController['_pubNub']).toBeUndefined();
      expect(pubNub.unsubscribeAll).toHaveBeenCalled();
      expect(pubNub.stop).toHaveBeenCalled();
      expect(userConfig.deleteRcEventSubscription).toHaveBeenCalled();
      expect(rcSubscriptionController['_lastSubscription']).toBeUndefined();
      expect(jobScheduler.cancelJob).toHaveBeenCalledWith(
        'RC_RENEW_SUBSCRIPTION',
      );
    });
  });

  describe('handleNotification', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      rcSubscriptionController['startSubscription'] = jest.fn();
      rcSubscriptionController['_pauseSubscription'] = jest.fn();
      rcSubscriptionController['cleanUpSubscription'] = jest.fn();
    });

    it('should call startSubscription handleWakeUp', () => {
      rcSubscriptionController['_handleWakeUp']();
      expect(rcSubscriptionController['startSubscription']).toHaveBeenCalled();
    });

    it('should call _handleOnLine when handleOnline is online', () => {
      rcSubscriptionController['_handleOnLine']({ onLine: true });
      expect(rcSubscriptionController['startSubscription']).toHaveBeenCalled();
    });

    it('should not call _handleOnLine when handleOnline is offline', () => {
      rcSubscriptionController['_handleOnLine']({ onLine: false });
      expect(
        rcSubscriptionController['startSubscription'],
      ).not.toHaveBeenCalled();
      expect(rcSubscriptionController['_pauseSubscription']).toHaveBeenCalled();
    });

    it('should not call when startSubscription when _handleFocus ', () => {
      rcSubscriptionController['_handleFocus']();
      expect(rcSubscriptionController['startSubscription']).toHaveBeenCalled();
    });

    it('should cleanup subscription when permission is off', () => {
      rcSubscriptionController['_handlePermissionChange'](false);
      expect(
        rcSubscriptionController['cleanUpSubscription'],
      ).toHaveBeenCalled();
    });

    it('should start subscription when permission is on', () => {
      rcSubscriptionController['_handlePermissionChange'](true);
      expect(rcSubscriptionController['startSubscription']).toHaveBeenCalled();
    });
  });
});
