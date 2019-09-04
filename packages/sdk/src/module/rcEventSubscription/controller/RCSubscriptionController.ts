/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-23 10:50:01
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import Pubnub from 'pubnub';
import { RcSubscriptionApi } from 'sdk/api/ringcentral/RcSubscriptionApi';
import {
  RcSubscriptionInfo,
  ETransportType,
  RcSubscriptionParams,
} from 'sdk/api/ringcentral/types';
import { notificationCenter, SERVICE, WINDOW, SUBSCRIPTION } from 'sdk/service';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { mainLogger } from 'foundation/log';
import {
  jobScheduler,
  JOB_KEY,
  JobInfo,
} from 'sdk/framework/utils/jobSchedule';
import { RCSubscriptionKeys, EVENT_PREFIX } from '../constants';
import { RCEventSubscriptionConfig } from '../config';
import {
  PubNubEventPayloadMessage,
  PubNubStatusEvent,
  PNCategories,
} from './types';
import {
  SequenceProcessorHandler,
  SingletonSequenceProcessor,
} from 'sdk/framework/processor';
import { SubscriptionProcessor } from './SubscriptionProcessor';

const DECRYPT_INFO = { keyEncoding: 'base64', keyLength: 128, mode: 'ecb' };
const RC_SUBSCRIPTION_RENEWAL_INTERVAL = 14 * 60; // 14 minutes
const RC_SUBSCRIPTION_SAFE_INTERVAL = 1 * 60 * 1000; // 1 minutes
const NORMAL_PN_STATUS = [
  PNCategories.PNConnectedCategory,
  PNCategories.PNReconnectedCategory,
];
const CLASS_NAME = 'RCSubscriptionController';
const SLASH_CHAR = '/';
enum INIT_STATUS {
  UN_INIT,
  INPROGRESS,
  DONE,
}

type PubNubChanel = {
  address: string;
  subscriberKey: string;
};

class RCSubscriptionController {
  constructor(private _userConfig: RCEventSubscriptionConfig) {}
  private _lastSubscription: RcSubscriptionInfo;
  private _pubNubChanel: PubNubChanel;
  private _pubNub: Pubnub;
  private _initStatus = INIT_STATUS.UN_INIT;
  private _eventNotificationKeyMap = {
    [RCSubscriptionKeys.MessageStore]: SUBSCRIPTION.MESSAGE_STORE,
    [RCSubscriptionKeys.MissedCall]: SUBSCRIPTION.MISSED_CALLS,
    [RCSubscriptionKeys.Voicemail]: SUBSCRIPTION.VOICEMAIL,
    [RCSubscriptionKeys.TelephonyDetail]:
      SUBSCRIPTION.PRESENCE_WITH_TELEPHONY_DETAIL,
  };
  private _sequenceSubscriptionHandler: SequenceProcessorHandler;

  private async _init() {
    if (this._initStatus === INIT_STATUS.UN_INIT) {
      this._initStatus = INIT_STATUS.INPROGRESS;
      mainLogger.tags(CLASS_NAME).log('init subscription');

      this._lastSubscription = (await this._userConfig.getRcEventSubscription())!;
      this._listenChanges();
      this._initStatus = INIT_STATUS.DONE;
    }
  }

  private _listenChanges() {
    notificationCenter.on(SERVICE.WAKE_UP_FROM_SLEEP, this._handleWakeUp);
    notificationCenter.on(WINDOW.ONLINE, this._handleOnLine);
    notificationCenter.on(
      SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
      this._handlePermissionChange,
    );
  }

  async startSubscription() {
    const processor = new SubscriptionProcessor(
      `${CLASS_NAME}_${Date.now()}`,
      async () => {
        await this._startSubscription();
      },
    );

    if (!this._sequenceSubscriptionHandler) {
      this._sequenceSubscriptionHandler = SingletonSequenceProcessor.getSequenceProcessorHandler(
        {
          name: CLASS_NAME,
        },
      );
    }
    this._sequenceSubscriptionHandler.addProcessor(processor);
  }

  private async _startSubscription() {
    try {
      if (this._initStatus === INIT_STATUS.INPROGRESS) {
        mainLogger
          .tags(CLASS_NAME)
          .log('_startSubscription => return because is initialing');
        return;
      }

      if (this._initStatus === INIT_STATUS.UN_INIT) {
        mainLogger
          .tags(CLASS_NAME)
          .log('_startSubscription => need to init subscription before start');
        await this._init();
      }

      if (!navigator.onLine) {
        mainLogger
          .tags(CLASS_NAME)
          .log('_startSubscription => return because no network');
        return;
      }

      const canDoSubscription = await this._canDoSubscription();
      if (!canDoSubscription) {
        mainLogger
          .tags(CLASS_NAME)
          .log(
            '_startSubscription => can not do subscription, should stop if need',
            this._lastSubscription,
          );
        const isSubscribed = this._hasValidSubscriptionInfo();
        return isSubscribed && (await this.cleanUpSubscription());
      }

      const { subscription, isUpdated } = await this._loadSubscription();
      mainLogger
        .tags(CLASS_NAME)
        .log('_startSubscription => load subscription success', {
          subscription,
          isUpdated,
        });

      if (subscription) {
        this._startPubNub(subscription);

        this._scheduleSubscriptionJob(isUpdated);
      }
    } catch (error) {
      mainLogger
        .tags(CLASS_NAME)
        .log('_startSubscription => startSubscription failed', error);
      await this._pauseSubscription();
    }
  }

  private async _loadSubscription() {
    const isAlive = this._isSubscriptionAlive();
    let isUpdated = true;
    let subscription: RcSubscriptionInfo = this._lastSubscription;
    if (isAlive) {
      const checkNeedUpdateRes = await this._shouldUpdateSubscription();
      mainLogger
        .tags(CLASS_NAME)
        .log(
          '_loadSubscription => subscription is alive, should update:',
          checkNeedUpdateRes.shouldUpdate,
        );
      if (checkNeedUpdateRes.shouldUpdate) {
        const params = await this._buildSubscription(
          checkNeedUpdateRes.newEvents,
        );
        subscription = await RcSubscriptionApi.updateSubscription(
          this._lastSubscription.id,
          params,
        );
      } else {
        mainLogger.tags(CLASS_NAME).log('subscription not updated');
        isUpdated = false;
      }
    } else {
      mainLogger
        .tags(CLASS_NAME)
        .log(
          '_loadSubscription => subscription is not alive, create new subscription',
          {
            'this._lastSubscription': this._lastSubscription,
          },
        );
      await this._clearSubscription();
      const newEvents = await this._getNeedSubscriptionEvents();
      const params = await this._buildSubscription(newEvents);
      subscription = await RcSubscriptionApi.createSubscription(params);
      mainLogger
        .tags(CLASS_NAME)
        .log('subscription created,  new subscription', {
          new: subscription,
        });
    }

    await this._saveSubscription(subscription);
    return { subscription, isUpdated };
  }

  private async _clearSubscription() {
    this._sequenceSubscriptionHandler &&
      this._sequenceSubscriptionHandler.cancelAll();
    delete this._lastSubscription;
    delete this._pubNubChanel;
    await this._userConfig.deleteRcEventSubscription();
    await jobScheduler.cancelJob(JOB_KEY.RC_RENEW_SUBSCRIPTION);
  }

  private _clearPubNub() {
    if (this._pubNub) {
      this._pubNub.unsubscribeAll();
      this._pubNub.stop();
      delete this._pubNub;
    }
  }

  private async _scheduleSubscriptionJob(ignoreFirstTime: boolean) {
    mainLogger
      .tags(CLASS_NAME)
      .log(' _scheduleSubscriptionJob -> ignoreFirstTime', ignoreFirstTime);
    const info: JobInfo = {
      key: JOB_KEY.RC_RENEW_SUBSCRIPTION,
      intervalSeconds: RC_SUBSCRIPTION_RENEWAL_INTERVAL,
      periodic: true,
      needNetwork: true,
      executeFunc: async (callback: (successful: boolean) => void) => {
        mainLogger
          .tags(CLASS_NAME)
          .log('_scheduleSubscriptionJob, _renewSubscription');
        await this._renewSubscription();
        callback(true);
      },
    };

    if (ignoreFirstTime) {
      jobScheduler.scheduleAndIgnoreFirstTime(info);
    } else {
      jobScheduler.scheduleJob(info);
    }
  }

  private async _renewSubscription() {
    if (
      !this._lastSubscription ||
      !this._lastSubscription.deliveryMode.subscriberKey
    ) {
      jobScheduler.cancelJob(JOB_KEY.RC_RENEW_SUBSCRIPTION);
      return;
    }

    try {
      const isAlive = this._isSubscriptionAlive(0);
      if (!isAlive) {
        this._startSubscription();
        return;
      }

      const subscription = await this._requestRenewSubscription();
      mainLogger.tags(CLASS_NAME).log('_renewSubscription', { subscription });
      this._startPubNub(subscription);
    } catch (error) {
      mainLogger.tags(CLASS_NAME).log('renewSubscription failed', error);
      await this._pauseSubscription();
    }
  }

  private async _requestRenewSubscription() {
    const subscription = await RcSubscriptionApi.renewSubscription(
      this._lastSubscription.id,
    );
    await this._saveSubscription(subscription);
    return subscription;
  }

  private async _pauseSubscription() {
    this._clearPubNub();
    this._sequenceSubscriptionHandler &&
      this._sequenceSubscriptionHandler.cancelAll();
    jobScheduler.cancelJob(JOB_KEY.RC_RENEW_SUBSCRIPTION);

    this._tryRestartPubnub();
  }

  private _tryRestartPubnub() {
    notificationCenter.once(WINDOW.FOCUS, this._handleFocus);
  }

  async cleanUpSubscription() {
    mainLogger
      .tags(CLASS_NAME)
      .log(
        ' RCSubscriptionController -> stopSubscription ->',
        this._lastSubscription,
      );

    try {
      this._clearPubNub();
      await this._clearSubscription();
    } catch (error) {
      mainLogger.tags(CLASS_NAME).log('stopSubscription failed', error);
    }
  }

  private _isSubscriptionAlive(safeInterval = RC_SUBSCRIPTION_SAFE_INTERVAL) {
    return !!(
      this._lastSubscription &&
      this._hasValidSubscriptionInfo() &&
      Date.now() <
        Date.parse(this._lastSubscription.expirationTime) - safeInterval
    );
  }

  private _hasValidSubscriptionInfo() {
    return !!(
      _.get(this._lastSubscription, 'deliveryMode.subscriberKey') &&
      _.get(this._lastSubscription, 'deliveryMode.address')
    );
  }

  private _getSubscribedEvents() {
    const events =
      (this._lastSubscription && this._lastSubscription.eventFilters) || [];
    return events.map((event: string) => this._getRawEvent(event));
  }

  private async _shouldUpdateSubscription() {
    const newEvents = await this._getNeedSubscriptionEvents();
    const events = this._getSubscribedEvents();
    const shouldUpdate = !_.isEqual(events.sort(), newEvents.sort());
    return {
      newEvents,
      shouldUpdate,
    };
  }

  private async _canDoSubscription() {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    return await rcInfoService.isVoipCallingAvailable();
  }

  private async _saveSubscription(newSubscription: RcSubscriptionInfo) {
    if (!_.isEqual(newSubscription, this._lastSubscription)) {
      await this._userConfig.setRcEventSubscription(newSubscription);
      this._lastSubscription = newSubscription;
    }
  }

  private _handleWakeUp = () => {
    mainLogger
      .tags(CLASS_NAME)
      .log('_handleWakeUp => receive wake up, try start subscription');
    this.startSubscription();
  };

  private _handlePermissionChange = (enabled: boolean) => {
    if (enabled) {
      this.startSubscription();
    } else {
      mainLogger
        .tags(CLASS_NAME)
        .log(
          '_handlePermissionChange => receive voip permission off, try pause, subscription',
        );
      this.cleanUpSubscription();
    }
  };

  private _handleOnLine = (value: { onLine: boolean }) => {
    if (value) {
      mainLogger
        .tags(CLASS_NAME)
        .log('_handleOnLine => receive online, try start subscription', value);

      if (value.onLine) {
        this.startSubscription();
      } else {
        mainLogger
          .tags(CLASS_NAME)
          .log('_handleOnLine => receive offline, try pause, subscription');
        this._pauseSubscription();
      }
    }
  };

  private _handleFocus = () => {
    mainLogger
      .tags(CLASS_NAME)
      .log('_handleFocus => receive focus, try start subscription');
    this.startSubscription();
  };

  private _startPubNub(newSubscription: RcSubscriptionInfo) {
    const subscriberKey = _.get(newSubscription, 'deliveryMode.subscriberKey');
    const address = _.get(newSubscription, 'deliveryMode.address');
    const needUpdatePubNub =
      this._pubNub && this._pubNubChanel
        ? subscriberKey !== this._pubNubChanel.subscriberKey ||
          address !== this._pubNubChanel.address
        : true;

    if (!needUpdatePubNub) {
      mainLogger.tags(CLASS_NAME).log('no needUpdatePubNub -  _startPubNub');
      return;
    }

    if (address && subscriberKey) {
      try {
        this._clearPubNub();
        mainLogger.tags(CLASS_NAME).log('startPubNub', {
          subscribeKey: subscriberKey,
          address,
        });
        this._pubNub = new Pubnub({
          subscribeKey: subscriberKey,
          ssl: true,
          restore: true,
        });

        this._pubNub.addListener({
          message: this._notifyMessages,
          status: this._notifyStatus,
        });
        this._pubNub.subscribe({
          channels: [address],
        });
        this._pubNubChanel = {
          address,
          subscriberKey,
        };
      } catch (error) {
        mainLogger.tags(CLASS_NAME).log('_startPubNub with error', error);
      }
    }
  }

  private _notifyMessages = (payLoad: any) => {
    const message = payLoad && payLoad.message;
    if (!message) {
      mainLogger
        .tags(CLASS_NAME)
        .log('_notifyMessages, return because no valid message');
      return;
    }

    this._dispatchMessages(this._decrypt(message));
  };

  private _decrypt(message: any) {
    return this._pubNub.decrypt(
      message,
      this._lastSubscription.deliveryMode.encryptionKey,
      {
        encryptKey: false,
        ...DECRYPT_INFO,
      },
    );
  }

  private _getRawEvent(completedEvent: string) {
    return _.last(completedEvent.split(SLASH_CHAR));
  }

  private async _dispatchMessages(message: PubNubEventPayloadMessage) {
    const { event = undefined, body = undefined } = message || {};
    if (!event || !body) {
      return;
    }
    const originalEvent = this._getRawEvent(event);

    const notificationKey =
      originalEvent && this._eventNotificationKeyMap[originalEvent];
    mainLogger.tags(CLASS_NAME).log('_dispatchMessages, receive message', {
      event,
      body,
      notificationKey,
    });

    if (notificationKey) {
      notificationCenter.emitKVChange(notificationKey, body);
    }
  }

  private _notifyStatus = (status: PubNubStatusEvent) => {
    mainLogger.tags(CLASS_NAME).log('_notifyStatus', status);
    if (status && !status.error  && NORMAL_PN_STATUS.includes(status.category)) {
      notificationCenter.emitKVChange(
        SERVICE.RC_EVENT_SUBSCRIPTION.SUBSCRIPTION_CONNECTED,
        true,
      );
    }
  };

  private async _buildSubscription(
    events: string[],
  ): Promise<RcSubscriptionParams> {
    return {
      eventFilters: this._fullFillEvents(events),
      deliveryMode: {
        transportType: ETransportType.PubNub,
        encryption: true,
      },
    };
  }

  private _fullFillEvents(rawEvents: string[]) {
    return rawEvents.map((raw: string) => `${EVENT_PREFIX}${raw}`);
  }

  private async _getNeedSubscriptionEvents(): Promise<string[]> {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const events: string[] = [];
    if (rcInfoService.isVoipCallingAvailable()) {
      events.push(
        RCSubscriptionKeys.TelephonyDetail,
        RCSubscriptionKeys.MessageStore,
        RCSubscriptionKeys.MissedCall,
        RCSubscriptionKeys.Voicemail,
      );
    }
    return events;
  }
}

export { RCSubscriptionController };
