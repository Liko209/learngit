/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 13:42:30
 * Copyright © RingCentral. All rights reserved.
 */
//
import { CALLING_OPTIONS, AUDIO_SOUNDS_INFO } from 'sdk/module/profile';
import { inject } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { SettingService } from 'sdk/module/setting/service/SettingService';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';
import { CallLogService } from 'sdk/module/RCItems/callLog';
import { CallLog } from 'sdk/module/RCItems/callLog/entity/CallLog';
import { IEntityChangeObserver } from 'sdk/framework/controller/types';
import {
  TelephonyService as ServerTelephonyService,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'sdk/module/telephony';
import {
  MAKE_CALL_ERROR_CODE,
  CALL_ACTION_ERROR_CODE,
  RINGER_ADDITIONAL_TYPE,
  TRANSFER_TYPE,
  CallOptions
} from 'sdk/module/telephony/types';
import { RC_INFO, notificationCenter, SERVICE } from 'sdk/service';
import { PersonService } from 'sdk/module/person';
import { GlobalConfigService } from 'sdk/module/config';
import { PhoneNumberModel } from 'sdk/module/person/entity';
import { mainLogger } from 'foundation/log';
import { TelephonyStore } from '../store';
import { ToastCallError } from './ToastCallError';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ANONYMOUS_NUM, NOTIFY_THROTTLE_FACTOR } from '../interface/constant';
import { reaction, IReactionDisposer, runInAction, action } from 'mobx';
import { RCInfoService } from 'sdk/module/rcInfo';
import { isFirefox, isWindows } from '@/common/isUserAgent';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import { AccountService } from 'sdk/module/account';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { IClientService, CLIENT_SERVICE } from '@/modules/common/interface';
import i18next from 'i18next';
import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';
import storeManager from '@/store';
import { SettingEntityIds, UserSettingEntity } from 'sdk/module/setting';
import keypadBeeps from './sounds/sounds.json';
import SettingModel from '@/store/models/UserSetting';
import { IPhoneNumberRecord } from 'sdk/api';
import { showRCDownloadDialog } from './utils';
import { OpenDialogE911 } from '../container/E911';
import { IMediaService, IMedia } from '@/interface/media';
import {
  SETTING_ITEM__RINGER_SOURCE,
  SETTING_ITEM__SPEAKER_SOURCE,
} from '@/modules/setting/constant';
import { isObject, throttle } from 'lodash';
import { sleep } from '../helpers';
import { ActiveCall } from 'sdk/module/rcEventSubscription/types';
import { PHONE_SETTING_ITEM } from '../TelephonySettingManager/constant';
import config from '@/config';
import { ItemService } from 'sdk/module/item';
import { JError, ERROR_TYPES, ERROR_CODES_NETWORK } from 'sdk/error';
import { RingtonePrefetcher } from '../../notification/RingtonePrefetcher';
import { isCurrentUserDND } from '@/modules/notification/utils';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { Item } from 'sdk/module/item/entity';
import ItemModel from '@/store/models/Item';
import ConferenceItemModel from '@/store/models/ConferenceItem';

const DIALER_OPENED_KEY = 'dialerOpenedCount';
class TelephonyService {
  static TAG: string = '[UI TelephonyService] ';

  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;
  @inject(CLIENT_SERVICE) private _clientService: IClientService;
  private _ringtonePrefetcher: RingtonePrefetcher

  private _serverTelephonyService = ServiceLoader.getInstance<ServerTelephonyService>(ServiceConfig.TELEPHONY_SERVICE);
  private _rcInfoService = ServiceLoader.getInstance<RCInfoService>(
    ServiceConfig.RC_INFO_SERVICE,
  );
  private _globalConfigService = ServiceLoader.getInstance<GlobalConfigService>(
    ServiceConfig.GLOBAL_CONFIG_SERVICE,
  );
  private _phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(
    ServiceConfig.PHONE_NUMBER_SERVICE,
  );
  private _itemService = ServiceLoader.getInstance<ItemService>(
    ServiceConfig.ITEM_SERVICE
  );
  private _voicemailService = ServiceLoader.getInstance<VoicemailService>(
    ServiceConfig.VOICEMAIL_SERVICE,
  );
  private _callLogService = ServiceLoader.getInstance<CallLogService>(
    ServiceConfig.CALL_LOG_SERVICE,
  );
  private _mediaService = jupiter.get<IMediaService>(IMediaService);
  private _muteRingtone: boolean = false;
  private _outputDevices: string[] | 'all' | null = null;
  private _callEntityId?: number;
  private _hasActiveOutBoundCallDisposer: IReactionDisposer;
  private _callerPhoneNumberDisposer: IReactionDisposer;
  private _incomingCallDisposer: IReactionDisposer;
  private _defaultCallerPhoneNumberDisposer: IReactionDisposer;
  private _isExtDisposer: IReactionDisposer;
  private _callStateDisposer: IReactionDisposer;
  private _ringerDisposer: IReactionDisposer;
  private _speakerDisposer: IReactionDisposer;
  private _callEntityIdDisposer: IReactionDisposer;
  private _keypadBeepPool: IMedia[];
  private _currentSoundTrackForBeep: number | null;
  private _canPlayOgg: boolean = this._mediaService.canPlayType('audio/ogg');
  private _isStartingConference = false;
  protected _voicemailNotificationObserver: IEntityChangeObserver;
  protected _callLogNotificationObserver: IEntityChangeObserver<CallLog>;

  private _onMadeOutgoingCall = () => {
    // TODO: This should be a list in order to support multiple call
    // Ticket: https://jira.ringcentral.com/browse/FIJI-4274
    // this._telephonyStore.id = id;
    // need factor in new module design
    // if has incoming call voicemail should be pause
    storeManager.getGlobalStore().set(GLOBAL_KEYS.INCOMING_CALL, true);
    // this._callEntityId = id;

    this._telephonyStore.directCall();

    if (this._telephonyStore.call) {
      const { uuid } = this._telephonyStore.call;
      mainLogger.info(
        `${TelephonyService.TAG} Call object created, call id=${uuid}`,
      );
    }
  };

  private _onReceiveIncomingCall = async () => {
    const shouldIgnore = !(await this._isJupiterDefaultApp()) || isCurrentUserDND() || this._telephonyStore.isThirdCall;
    if (shouldIgnore) {
      return;
    }

    this._telephonyStore.incomingCall();
    // need factor in new module design
    // if has incoming call voicemail should be pause
    storeManager.getGlobalStore().set(GLOBAL_KEYS.INCOMING_CALL, true);

    if (this._telephonyStore.call) {
      const { fromNum, uuid } = this._telephonyStore.call;
      mainLogger.info(
        `${
        TelephonyService.TAG
        }Call object created, call id=${uuid}, from name=${'fromName'}, from num=${fromNum}`,
      );
    }
  };
  private get _ringtone() {
    return this._ringtonePrefetcher.media
  }
  private _getCurrentRingtoneSetting = async () => {
    const entity = await ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    ).getById<AUDIO_SOUNDS_INFO>(PHONE_SETTING_ITEM.SOUND_INCOMING_CALL);
    return entity ? (entity.value ? entity.value.id : undefined) : undefined;
  };
  private _playRingtone = async () => {
    const name = await this._getCurrentRingtoneSetting();
    if (!name) {
      mainLogger.tags(TelephonyService.TAG).warn('unable to find ringtone');
      return;
    }
    if (!this._ringtone || (this._ringtone.playing && !this._ringtone.muted)) {
      return;
    }

    const muted = isCurrentUserDND() || this._muteRingtone;
    this._ringtone.setLoop(true);
    this._ringtone.setMute(muted);
    this._ringtone.setOutputDevices(this._outputDevices)
    mainLogger
      .tags(TelephonyService.TAG)
      .info('ready to play the ringtone', new Date());
    this._ringtone.play();
  };

  private _stopRingtone = async () => {
    mainLogger.tags(TelephonyService.TAG).info(`pause audio, ${new Date()}`);
    if (!this._ringtone) {
      return;
    }
    this._ringtone.stop();
    // to avoid new device plugged in, which trigger the ringtone replay.
    this._ringtone.setMute(true);
    return;
  };

  private _resetCallState() {
    storeManager.getGlobalStore().set(GLOBAL_KEYS.INCOMING_CALL, false);
    /**
     * Be careful that the server might not respond for the request, so since we design
     * the store as a singleton then we need to restore every single state for the next call.
     */
    // delete this._callEntityId;
  }

  private _setDialerOpenedCount = () => {
    const cache = this._getDialerOpenedCount() || {};
    const glipUserId = this._getGlipUserId();
    const openedTimes = cache[glipUserId] || 0;

    this._globalConfigService.put(
      TelephonyService.TAG,
      DIALER_OPENED_KEY,
      Object.assign(cache, {
        [glipUserId]: openedTimes + 1,
      }),
    );
  };

  private _getDialerOpenedCount = () => {
    const cache = this._globalConfigService.get(
      TelephonyService.TAG,
      DIALER_OPENED_KEY,
    );
    this._telephonyStore.dialerOpenedCount =
      (cache && cache[this._getGlipUserId()]) || 0;
    return cache;
  };

  private _getGlipUserId = () => {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return userConfig.getGlipUserId();
  };

  init = () => {
    this._ringtonePrefetcher = new RingtonePrefetcher(this._telephonyStore.mediaTrackIds.telephony, PHONE_SETTING_ITEM.SOUND_INCOMING_CALL)
    if (this._canPlayOgg) {
      this._keypadBeepPool = Array(this._telephonyStore.maximumInputLength)
        .fill(1)
        .map(idx =>
          this._mediaService.createMedia({
            trackId: `keypadBeep_${idx}`,
          }),
        );
    }
    this._telephonyStore.canUseTelephony = true;

    this._getDialerOpenedCount();

    notificationCenter.on(
      RC_INFO.EXTENSION_PHONE_NUMBER_LIST,
      this._getCallerPhoneNumberList,
    );

    notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
      const globalStore = storeManager.getGlobalStore();
      this._serverTelephonyService.setDataCollectionInfoConfig({
        isProduction: config.isProductionAccount(),
        userInfo: {
          userId: globalStore.get(GLOBAL_KEYS.CURRENT_USER_ID),
          companyId: globalStore.get(GLOBAL_KEYS.CURRENT_COMPANY_ID),
        }
      })
    });

    this._serverTelephonyService.setTelephonyDelegate({
      onMadeOutgoingCall: this._onMadeOutgoingCall,
      onReceiveIncomingCall: this._onReceiveIncomingCall,
    });
    this._hasActiveOutBoundCallDisposer = reaction(
      () => ({
        hasActiveOutBoundCall: !this._telephonyStore.hasActiveOutBoundCall,
        defaultCallerPhoneNumber: this._telephonyStore.defaultCallerPhoneNumber,
        isEndMultipleIncomingCall: this._telephonyStore.isEndMultipleIncomingCall
      }),
      async ({
        hasActiveOutBoundCall,
        defaultCallerPhoneNumber,
        isEndMultipleIncomingCall
      }: {
        hasActiveOutBoundCall: boolean;
        defaultCallerPhoneNumber: string;
        isEndMultipleIncomingCall: boolean;
      }) => {
        // restore things to default values
        if (!hasActiveOutBoundCall && !isEndMultipleIncomingCall) {
          runInAction(() => {
            this.deleteInputString(true);
            this.setCallerPhoneNumber(defaultCallerPhoneNumber);
          });
        }
      },
      { fireImmediately: true },
    );

    // ringer
    this._ringerDisposer = reaction(
      () => {
        const setting = getEntity<
          UserSettingEntity,
          SettingModel<MediaDeviceInfo>
        >(ENTITY_NAME.USER_SETTING, SETTING_ITEM__RINGER_SOURCE);
        return {
          deviceInfo: setting.value,
          source: setting.source,
        } as {
          deviceInfo: MediaDeviceInfo | RINGER_ADDITIONAL_TYPE;
          source: MediaDeviceInfo[];
        };
      },
      ({
        deviceInfo,
      }) => {
        if (!deviceInfo) {
          return;
        }
        const isOffDevice = isObject(deviceInfo) && (deviceInfo as MediaDeviceInfo).deviceId === RINGER_ADDITIONAL_TYPE.OFF
        const isAllDevice = isObject(deviceInfo) && (deviceInfo as MediaDeviceInfo).deviceId === RINGER_ADDITIONAL_TYPE.ALL;
        const isDefaultDevice = isObject(deviceInfo) && (deviceInfo as MediaDeviceInfo).deviceId === RINGER_ADDITIONAL_TYPE.DEFAULT;

        this._muteRingtone = isOffDevice;

        if (isOffDevice) {
          this._outputDevices = [];
        } else if (isAllDevice) {
          this._outputDevices = 'all';
        } else if (isDefaultDevice) {
          this._outputDevices = null;
        } else {
          this._outputDevices = [
            (deviceInfo as MediaDeviceInfo).deviceId,
          ]
        }

        if (!this._ringtone) {
          return;
        }

        if (isOffDevice) {
          this._ringtone.setOutputDevices([]);
          return;
        }

        if (isAllDevice) {
          this._ringtone.setOutputDevices('all');
          return;
        }

        if (isDefaultDevice) {
          this._ringtone.setOutputDevices(null);
          return;
        }

        this._ringtone.setOutputDevices([
          (deviceInfo as MediaDeviceInfo).deviceId,
        ]);
      },
    );
    // speaker
    this._speakerDisposer = reaction(
      () => {
        const setting = getEntity<
          UserSettingEntity,
          SettingModel<MediaDeviceInfo>
        >(ENTITY_NAME.USER_SETTING, SETTING_ITEM__SPEAKER_SOURCE);
        return {
          deviceInfo: setting.value,
          source: setting.source,
        } as {
          deviceInfo: MediaDeviceInfo | RINGER_ADDITIONAL_TYPE;
          source: MediaDeviceInfo[];
        };
      },
      ({ deviceInfo }) => {
        if (!deviceInfo) {
          this._keypadBeepPool.forEach(keypadBeep => {
            keypadBeep.setOutputDevices([]);
          });
          return;
        }
        const isDefaultDevice = isObject(deviceInfo) && (deviceInfo as MediaDeviceInfo).deviceId === RINGER_ADDITIONAL_TYPE.DEFAULT;

        if (isDefaultDevice) {
          this._keypadBeepPool.forEach(keypadBeep => {
            keypadBeep.setOutputDevices(null);
          });
          return;
        }

        this._keypadBeepPool.forEach(keypadBeep => {
          keypadBeep.setOutputDevices([
            (deviceInfo as MediaDeviceInfo).deviceId,
          ]);
        });
      },
    );

    this._callerPhoneNumberDisposer = reaction(
      () => {
        // prettier-ignore
        const defaultCaller = getEntity<UserSettingEntity, SettingModel<IPhoneNumberRecord>>(
          ENTITY_NAME.USER_SETTING,
          PHONE_SETTING_ITEM.PHONE_CALLER_ID,
        ).value;
        return {
          defaultPhoneNumber: defaultCaller && defaultCaller.phoneNumber,
          callerPhoneNumberList: this._telephonyStore.callerPhoneNumberList,
        };
      },
      async ({
        defaultPhoneNumber,
        callerPhoneNumberList,
      }: {
        defaultPhoneNumber: string;
        callerPhoneNumberList: PhoneNumberModel[];
      }) => {
        if (!callerPhoneNumberList) {
          return;
        }
        if (defaultPhoneNumber) {
          this._telephonyStore.defaultCallerPhoneNumber = defaultPhoneNumber;
        }
      },
      { fireImmediately: true },
    );

    this._incomingCallDisposer = reaction(
      () => this._telephonyStore.isIncomingCall,
      isIncomingCall => {
        if (isIncomingCall) {
          this._playRingtone();
          return;
        }
        this._stopRingtone();
      },
      { fireImmediately: true },
    );
    this._defaultCallerPhoneNumberDisposer = reaction(
      () => this._telephonyStore.defaultCallerPhoneNumber,
      async () => {
        if (!this._telephonyStore.hasManualSelected) {
          this._telephonyStore.chosenCallerPhoneNumber = this._telephonyStore.defaultCallerPhoneNumber;
        }
      },
    );

    this._isExtDisposer = reaction(
      () => this._telephonyStore.phoneNumber,
      async phoneNumber => {
        let result = await this.isShortNumber(phoneNumber);
        if (!result && phoneNumber && await this.isSpecialNumber(phoneNumber)) {
          const person = await this.matchContactByPhoneNumber(phoneNumber);
          result = person !== null;
        }
        this._telephonyStore.isExt = result;
      },
    );

    this._callStateDisposer = reaction(
      () => !!this._telephonyStore.endCall,
      hasCallEnd => {
        if (hasCallEnd) {
          this._telephonyStore.end();
          this._resetCallState();
        }
      },
    );

    this._callEntityIdDisposer = reaction(
      () => this._telephonyStore.call && this._telephonyStore.call.id,
      callId => {
        this._callEntityId = callId;
      }
    );

    this._currentSoundTrackForBeep = 0;

    // triggering a change of caller id list
    this._getCallerPhoneNumberList();

    this._subscribeVoicemailNotification();

    this._subscribeMissedCallNotification();
  };

  async makeRCPhoneCall(phoneNumber: string, accessCode?: string) {
    const buildURL = (phoneNumber: string) => {
      enum RCPhoneCallURL {
        'RC' = 'rcmobile',
        'ATT' = 'attvr20',
        'TELUS' = 'rctelus',
      }
      const currentCompanyId = getGlobalValue(GLOBAL_KEYS.CURRENT_COMPANY_ID);
      const { rcBrand } = getEntity(ENTITY_NAME.COMPANY, currentCompanyId);
      return `${RCPhoneCallURL[rcBrand] ||
        RCPhoneCallURL['RC']}://call?number=${encodeURIComponent(accessCode ? `${phoneNumber},,${accessCode}#` : phoneNumber)}`;
    };
    const url = buildURL(phoneNumber);
    this._clientService.invokeApp(url, { fallback: showRCDownloadDialog });
    if (this._telephonyStore.callDisconnecting) {
      this._telephonyStore.closeDialer();
    }
  }
  private async _isJupiterDefaultApp() {
    const entity = await ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    ).getById(SettingEntityIds.Phone_DefaultApp);
    return (entity && entity.value) === CALLING_OPTIONS.GLIP;
  }

  private _getFromNumber() {
    // FIXME: move this logic to SDK and always using callerID
    const idx =
      this._telephonyStore.callerPhoneNumberList &&
      this._telephonyStore.callerPhoneNumberList.findIndex(
        phone =>
          phone.phoneNumber === this._telephonyStore.chosenCallerPhoneNumber,
      );
    let fromNumber;
    if (idx === -1 || typeof idx !== 'number') {
      fromNumber = undefined;
    } else {
      const fromEl = this._telephonyStore.callerPhoneNumberList[idx];
      fromNumber = fromEl.id ? fromEl.phoneNumber : ANONYMOUS_NUM;
    }
    return fromNumber;
  }

  private _makeCall = async (toNumber: string, options: Partial<CallOptions> & { callback?: Function } = {}) => {

    const { isValid } = await this.isValidNumber(toNumber);
    if (!isValid) {
      ToastCallError.toastInvalidNumber();
      return;
    }

    const { accessCode, callback } = options;
    const shouldMakeRcPhoneCall = !(await this._isJupiterDefaultApp());
    if (shouldMakeRcPhoneCall) {
      return this.makeRCPhoneCall(toNumber, accessCode);
    }
    callback && callback();

    const fromNumber = this._getFromNumber();

    mainLogger.info(
      `${
      TelephonyService.TAG
      }Make call with fromNumber: ${fromNumber}， and toNumber: ${toNumber}`,
    );
    if (accessCode) {
      this._telephonyStore.isConference = true;
    }
    const rv = await this._serverTelephonyService.makeCall(
      toNumber,
      { fromNumber, ...options },
    );

    switch (true) {
      case MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION === rv: {
        ToastCallError.toastNoNetwork();
        mainLogger.error(
          `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
        );
        return false;
      }
      case MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER === rv: {
        ToastCallError.toastInvalidNumber();
        mainLogger.error(
          `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
        );
        return false;
      }
      case MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP === rv: {
        ToastCallError.toastCountryBlockError();
        mainLogger.error(
          `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
        );
        return false;
      }
      case MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE === rv: {
        ToastCallError.toastVoipUnavailableError();
        mainLogger.error(
          `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
        );
        return false;
      }
      case MAKE_CALL_ERROR_CODE.NO_ERROR !== rv: {
        ToastCallError.toastCallFailed();
        mainLogger.error(
          `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
        );
        return false; // For other errors, need not show call UI
      }
      default:
        break;
    }

    return true;
  };

  ensureCallPermission = async (action: Function, options: { isShortNumber?: boolean } = {}) => {

    const callAvailable = await this._rcInfoService.isVoipCallingAvailable();
    if (!callAvailable) {
      ToastCallError.toastPermissionError();
      return false;
    }
    if (!options.isShortNumber && !this._serverTelephonyService.hasActiveDL()) {
      Notification.flashToast({
        message: 'telephony.prompt.noDLNotAllowedToMakeCall',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.CENTER,
        fullWidth: false,
        autoHideDuration: 5000,
        dismissible: true,
      });
      return false;
    }

    if (!options.isShortNumber && !this._serverTelephonyService.isEmergencyAddrConfirmed()) {
      this.openE911(action);
      return true;
    }

    return await action();
  };

  switchCall = async (otherDeviceCall: ActiveCall) => {
    const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM) as MultiEntityMapStore<Item, ItemModel>;
    const conference = itemStore.find((item: ItemModel) => item instanceof ConferenceItemModel && item.rcData.phoneNumber === otherDeviceCall.to);
    this._telephonyStore.isConference = conference !== null;
    const myNumber = (await this._rcInfoService.getAccountMainNumber()) || '';
    const rv = await this._serverTelephonyService.switchCall(myNumber, otherDeviceCall);

    switch (true) {
      case MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION === rv: {
        ToastCallError.toastSwitchCallNoNetwork();
        mainLogger.error(
          `${TelephonyService.TAG}Switch call error: ${rv.toString()}`,
        );
        return false;
      }
      default:
        break;
    }

    return true;
  }

  getSwitchCall = () => {
    return this._serverTelephonyService.getSwitchCall();
  }

  directCall = async (toNumber: string, options?: CallOptions) => {
    // TODO: SDK telephony service can't support multiple call, we need to check here. When it supports, we can remove it.
    // Ticket: https://jira.ringcentral.com/browse/FIJI-4275
    if (this._serverTelephonyService.getAllCallCount() > 0 && (!options || (options && !options.extraCall))) {
      mainLogger.warn(
        `${TelephonyService.TAG}Only allow to make one call at the same time`,
      );
      // when multiple call don't hangup
      return Promise.resolve(true);
    }
    const isShortNumber = (await this.isShortNumber(toNumber)) || (await this.isSpecialNumber(toNumber));
    const result = await this.ensureCallPermission(() => {
      return this._makeCall(toNumber, options)
    }, { isShortNumber });
    return result;
  };

  hangUp = (callId?: number) => {
    const callEntityId = callId || this._callEntityId;
    if (callEntityId) {
      mainLogger.info(
        `${TelephonyService.TAG}Hang up call id=${callEntityId}`,
      );
      this._serverTelephonyService.hangUp(callEntityId);
      this._resetCallState();
    }
  };

  answer = () => {
    if (this._callEntityId) {
      mainLogger.info(
        `${TelephonyService.TAG}answer call id=${this._callEntityId}`,
      );
      this._serverTelephonyService.answer(this._callEntityId);
    }
  };

  endAndAnswer = () => {
    if (this._callEntityId) {
      const endCallId = this._telephonyStore.ids.find(id => id !== this._callEntityId);

      if (!endCallId) return;

      mainLogger.info(
        `${TelephonyService.TAG}end and answer end call id=${endCallId}, answer call id=${this._callEntityId}`,
      );
      this._serverTelephonyService.hangUp(endCallId);
      this._serverTelephonyService.answer(this._callEntityId);
    }
  };

  sendToVoiceMail = () => {
    if (this._callEntityId) {
      mainLogger.info(
        `${TelephonyService.TAG}send to voicemail call id=${
        this._callEntityId
        }`,
      );
      this._serverTelephonyService.sendToVoiceMail(this._callEntityId);
    }
  };

  ignore = () => {
    if (this._callEntityId) {
      mainLogger.info(
        `${TelephonyService.TAG}ignore call id=${this._callEntityId}`,
      );
      this._serverTelephonyService.ignore(this._callEntityId);
    }
  };

  @action
  minimize = () => {
    const dialBtnPos = this._dialpadBtnRect;
    const _dialerRect = this._dialerRect;

    if (dialBtnPos && _dialerRect) {
      // animation
      this._telephonyStore.dialerMinimizeTranslateX =
        dialBtnPos.left +
        dialBtnPos.width / 2 -
        (_dialerRect.left + _dialerRect.width / 2);

      this._telephonyStore.dialerMinimizeTranslateY =
        dialBtnPos.top +
        dialBtnPos.height / 2 -
        (_dialerRect.top + _dialerRect.height / 2);

      this._telephonyStore.dialerWidth = _dialerRect.width;
      this._telephonyStore.dialerHeight = _dialerRect.height;

      this._telephonyStore.startAnimation();

      return;
    }
    // when no destination, hide the dialer directly.
    this._telephonyStore.closeDialer();
  };

  @action
  onAnimationEnd = () => {
    this._telephonyStore.closeDialer();
    this._telephonyStore.dialerMinimizeTranslateX = NaN;
    this._telephonyStore.dialerMinimizeTranslateY = NaN;
    this._telephonyStore.dialerWidth = NaN;
    this._telephonyStore.dialerHeight = NaN;
    this._telephonyStore.stopAnimation();
  };

  maximize = () => {
    this._telephonyStore.openDialer();
    this._telephonyStore.onDialerInputFocus();
  };

  onAfterDialerOpen = () => {
    this._setDialerOpenedCount();
    this._getDialerOpenedCount();
  };

  handleWindow = () => {
    if (this._telephonyStore.isDetached) {
      this._telephonyStore.attachedWindow();
      return;
    }
    this._telephonyStore.detachedWindow();
  };

  muteOrUnmute = () => {
    if (this._callEntityId) {
      const { isMute } = this._telephonyStore;
      isMute
        ? this._serverTelephonyService.unmute(this._callEntityId)
        : this._serverTelephonyService.mute(this._callEntityId);
      mainLogger.info(
        `${TelephonyService.TAG}${isMute ? 'unmute' : 'mute'} call entity id=${
        this._callEntityId
        }`,
      );
    }
  };

  matchContactByPhoneNumber = async (phone: string) => {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );

    return await personService.matchContactByPhoneNumber(phone);
  };

  getAllCallCount = () => {
    return (
      this._serverTelephonyService &&
      this._serverTelephonyService.getAllCallCount()
    );
  };

  holdOrUnhold = async () => {
    if (this._telephonyStore.holdDisabled || !this._callEntityId) {
      mainLogger.debug(
        `${TelephonyService.TAG}[TELEPHONY_HOLD_BUTTON_DISABLE_STATE]: ${
        this._telephonyStore.holdDisabled
        }`,
      );
      return;
    }

    let $fetch: Promise<any>;
    let isHeld: boolean = this._telephonyStore.held;

    if (isHeld) {
      mainLogger.info(
        `${TelephonyService.TAG}unhold call entity id=${this._callEntityId}`,
      );
      $fetch = this._serverTelephonyService.unhold(this._callEntityId);
    } else {
      mainLogger.info(
        `${TelephonyService.TAG}hold call entity id=${this._callEntityId}`,
      );
      $fetch = this._serverTelephonyService.hold(this._callEntityId);
    }

    try {
      await $fetch;
    } catch {
      isHeld
        ? ToastCallError.toastFailedToResume()
        : ToastCallError.toastFailedToHold();
      isHeld = !isHeld;
    }
  };

  startOrStopRecording = async () => {
    if (!this._callEntityId || this._telephonyStore.recordDisabled) {
      return;
    }

    let $fetch: Promise<any>;
    const isRecording: boolean = this._telephonyStore.isRecording;

    if (isRecording) {
      this._telephonyStore.isStopRecording = true;
      $fetch = this._serverTelephonyService.stopRecord(this._callEntityId);
    } else {
      if (
        !(await this._rcInfoService.isRCFeaturePermissionEnabled(
          ERCServiceFeaturePermission.ON_DEMAND_CALL_RECORDING,
        ))
      ) {
        ToastCallError.toastOnDemandRecording();
        return;
      }
      $fetch = this._serverTelephonyService.startRecord(this._callEntityId);
    }

    try {
      await $fetch;
      isRecording && (this._telephonyStore.isStopRecording = false);
    } catch (e) {
      if (isRecording) {
        ToastCallError.toastFailedToStopRecording();
        this._telephonyStore.isStopRecording = false;
      } else {
        switch (e) {
          case CALL_ACTION_ERROR_CODE.ACR_ON: {
            ToastCallError.toastAutoRecording();
            break;
          }
          default: {
            ToastCallError.toastFailedToRecord();
            break;
          }
        }
      }
    }
  };

  dtmf = (digits: string) => {
    if (!this._callEntityId) {
      return;
    }
    this._telephonyStore.inputKey(digits);
    return this._serverTelephonyService.dtmf(this._callEntityId, digits);
  };

  getComponent = () => [import('../container/AudioConference'), import('../container/Call')];

  setCallerPhoneNumber = (phoneNumber?: string) => {
    if (
      typeof phoneNumber !== 'string' &&
      this._telephonyStore.defaultCallerPhoneNumber
    ) {
      this._telephonyStore.chosenCallerPhoneNumber = this._telephonyStore.defaultCallerPhoneNumber;
    } else if (
      typeof phoneNumber !== 'string' &&
      this._telephonyStore.callerPhoneNumberList &&
      this._telephonyStore.callerPhoneNumberList.length
    ) {
      this._telephonyStore.chosenCallerPhoneNumber = this._telephonyStore.callerPhoneNumberList[0].phoneNumber;
    } else if (typeof phoneNumber === 'string' && phoneNumber.length) {
      this._telephonyStore.chosenCallerPhoneNumber = phoneNumber;
    }
    this._telephonyStore.hasManualSelected = true;
    mainLogger.info(
      `${TelephonyService.TAG} set caller phone number: ${
      this._telephonyStore.chosenCallerPhoneNumber
      }`,
    );
  };

  concatInputStringFactory = (prop: 'forwardString' | 'inputString') => (
    str: string,
  ) => {
    runInAction(() => {
      if (
        this._telephonyStore[prop].length <
        this._telephonyStore.maximumInputLength
      ) {
        this._telephonyStore[prop] += str;
        return;
      }
    });
  };

  updateInputStringFactory = (prop: 'forwardString' | 'inputString') => (
    str: string,
  ) => {
    runInAction(() => {
      this._telephonyStore[prop] = str.slice(
        0,
        this._telephonyStore.maximumInputLength,
      );
      return;
    });
  };

  deleteInputStringFactory = (prop: 'forwardString' | 'inputString') => (
    clearAll: boolean = false,
    start?: number,
    end?: number,
  ) => {
    if (!clearAll && (typeof start !== 'number' || typeof end !== 'number')) {
      throw new Error('Must pass the caret position');
    }
    runInAction(() => {
      if (clearAll) {
        this._telephonyStore[prop] = '';
        return;
      }
      this._telephonyStore[prop] = this._telephonyStore[prop]
        .split('')
        .filter((v, idx) => idx < (start as number) || idx > (end as number))
        .join('');

      return;
    });
  };

  deleteInputString = this.deleteInputStringFactory('inputString');

  dispose = () => {
    this._ringtonePrefetcher.dispose()
    this._hasActiveOutBoundCallDisposer &&
      this._hasActiveOutBoundCallDisposer();
    this._callerPhoneNumberDisposer && this._callerPhoneNumberDisposer();
    this._incomingCallDisposer && this._incomingCallDisposer();
    this._defaultCallerPhoneNumberDisposer &&
      this._defaultCallerPhoneNumberDisposer();
    this._isExtDisposer && this._isExtDisposer();
    this._callStateDisposer && this._callStateDisposer();
    this._ringerDisposer && this._ringerDisposer();
    this._speakerDisposer && this._speakerDisposer();
    this._callEntityIdDisposer && this._callEntityIdDisposer();
    this._voicemailService.removeEntityNotificationObserver(
      this._voicemailNotificationObserver,
    );
    this._callLogService.removeEntityNotificationObserver(
      this._callLogNotificationObserver,
    );

    this._stopRingtone();
    this._telephonyStore.hasManualSelected = false;
    delete this._telephonyStore;
    delete this._serverTelephonyService;
    delete this._callEntityId;
    delete this._hasActiveOutBoundCallDisposer;
    delete this._callerPhoneNumberDisposer;
    delete this._incomingCallDisposer;
    delete this._isExtDisposer;
    delete this._callStateDisposer;
    delete this._ringerDisposer;
    delete this._speakerDisposer;
    delete this._defaultCallerPhoneNumberDisposer;
    delete this._keypadBeepPool;
    delete this._callEntityIdDisposer;
    delete this._voicemailNotificationObserver;
  };

  @action
  _getCallerPhoneNumberList = async () => {
    const callerPhoneNumberList = await this._rcInfoService.getCallerIdList();
    runInAction(() => {
      this._telephonyStore.callerPhoneNumberList = callerPhoneNumberList;
    });
  };

  get lastCalledNumber() {
    return this._serverTelephonyService.userConfig.getLastCalledNumber() || '';
  }

  private get _dialpadBtnRect() {
    const destination = document.getElementById(
      this._telephonyStore.dialpadBtnId,
    );
    if (!destination) {
      return null;
    }
    return destination.getBoundingClientRect();
  }

  private get _dialerRect() {
    const dialer = document.getElementById(this._telephonyStore.dialerId);
    if (!dialer) {
      return null;
    }
    return (dialer.parentElement as HTMLDivElement).getBoundingClientRect();
  }

  startReply = () => {
    if (!this._callEntityId) {
      return;
    }
    return this._serverTelephonyService.startReply(this._callEntityId);
  };

  replyWithMessage = (message: string) => {
    if (!this._callEntityId) {
      return;
    }
    return this._serverTelephonyService.replyWithMessage(
      this._callEntityId,
      message,
    );
  };

  replyWithPattern = (
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) => {
    if (!this._callEntityId) {
      return;
    }
    return this._serverTelephonyService.replyWithPattern(
      this._callEntityId,
      pattern,
      time,
      timeUnit,
    );
  };

  isShortNumber = async (
    toNumber: string = this._telephonyStore.inputString,
  ) => {
    return this._phoneNumberService.isShortNumber(toNumber);
  };

  isSpecialNumber = async (
    toNumber: string = this._telephonyStore.inputString,
  ) => {
    return this._phoneNumberService.isSpecialNumber(toNumber);
  };

  isValidNumber = async (
    toNumber: string = this._telephonyStore.inputString,
  ) => {
    if (this._phoneNumberService.isValidNumber(toNumber)) {
      const res = await this.parsePhone(toNumber);
      return {
        toNumber,
        isValid: !!res,
        parsed: res,
      };
    }
    return {
      toNumber,
      isValid: false,
      parsed: null,
    };
  };

  parsePhone = async (toNumber: string = this._telephonyStore.inputString) => {
    return this._phoneNumberService.getLocalCanonical(toNumber);
  };

  park = () => {
    if (!this._callEntityId) {
      return;
    }

    if (this._telephonyStore.isStopRecording) {
      ToastCallError.toastParkErrorStopRecording();
      return;
    }

    return this._serverTelephonyService
      .park(this._callEntityId)
      .then((parkExtension: string) => {
        const message = `${i18next.t(
          'telephony.prompt.ParkOk',
        )}: ${parkExtension}`;
        Notification.flagToast({
          message,
          type: ToastType.SUCCESS,
          messageAlign: ToastMessageAlign.CENTER,
          fullWidth: false,
          dismissible: true,
        });
        this.hangUp();
      })
      .catch(e => {
        ToastCallError.toastParkError();
        mainLogger.info(`${TelephonyService.TAG}park call error: ${e}`);
      });
  };

  getForwardingNumberList = () => {
    return this._rcInfoService.getForwardingNumberList();
  };

  forward = (phoneNumber: string) => {
    if (!this._callEntityId) {
      return;
    }
    return this._serverTelephonyService.forward(
      this._callEntityId,
      phoneNumber,
    );
  };

  flip = (flipNumber: number) => {
    if (!this._callEntityId) {
      return;
    }
    return this._serverTelephonyService.flip(this._callEntityId, flipNumber);
  };

  getForwardPermission = () => {
    return this._rcInfoService.isRCFeaturePermissionEnabled(
      ERCServiceFeaturePermission.CALL_FORWARDING,
    );
  };

  /**
   * Perf: since it's a loop around search, we should not block the main thread
   * while searching for the next available <audio/> roundly
   * even if the sounds for each key last actually very short
   */
  private async _getPlayableSoundTrack(
    cursor = this._currentSoundTrackForBeep as number,
  ): Promise<[IMedia, number] | null> {
    if (!Array.isArray(this._keypadBeepPool)) {
      return null;
    }
    const currentSoundTrack = this._keypadBeepPool[cursor];

    // if the current <audio/> is playing, search for the next none
    if (currentSoundTrack.playing) {
      const { promise } = sleep();
      await promise;
      return Array.isArray(this._keypadBeepPool)
        ? this._getPlayableSoundTrack(
          ((cursor as number) + 1) % this._keypadBeepPool.length,
        )
        : null;
    }
    return [currentSoundTrack, cursor];
  }

  playBeep = async (value: string) => {
    const realValue = value === '+' ? '0' : value;
    const sound = keypadBeeps[realValue];
    if (
      this._keypadBeepPool &&
      this._canPlayOgg &&
      sound &&
      this._currentSoundTrackForBeep !== null
    ) {
      const res = await this._getPlayableSoundTrack();
      if (!Array.isArray(res)) {
        return;
      }
      const [currentSoundTrack, cursor] = res;
      currentSoundTrack.setSrc(sound);
      currentSoundTrack.play({ startTime: 0 });
      this._currentSoundTrackForBeep = cursor;
    }
  };

  openE911 = (successCallback?: Function) => {
    if (this._telephonyStore.hasShowE911) {
      return;
    }
    OpenDialogE911(successCallback);
    this._telephonyStore.switchE911Status(true);
  };

  needConfirmE911 = async () => {
    const lines = await this._rcInfoService.getDigitalLines();
    const isEmergency = this._serverTelephonyService.isEmergencyAddrConfirmed();
    return lines.length > 0 && !isEmergency;
  };

  needE911Prompt = async () => {
    const lines = await this._rcInfoService.getDigitalLines();
    const hasConfirmed = this._serverTelephonyService.isEmergencyAddrConfirmed();
    return lines.length > 0 && hasConfirmed;
  };

  startAudioConference = async (groupId: number) => {

    if (this._isStartingConference) {
      return true;
    }
    if (this._serverTelephonyService.getAllCallCount() > 0) {
      mainLogger.warn(
        `${TelephonyService.TAG}Only allow to make one call at the same time`,
      );
      // when multiple call don't hangup
      return true;
    }

    this._isStartingConference = true;

    const result = await this.ensureCallPermission(async () => {
      try {
        const { rc_data: { hostCode, phoneNumber } } = await this._itemService.startConference(groupId);
        return this._makeCall(phoneNumber, { accessCode: hostCode });
      } catch (error) {
        mainLogger.error(
          `${TelephonyService.TAG} Error when start a conference`,
          error
        );
        return this.handleStartAudioConferenceError(error)
      }
    });

    this._isStartingConference = false;
    return result;
  }

  handleStartAudioConferenceError(error: JError) {
    const isNetworkError = error.isMatch({
      type: ERROR_TYPES.NETWORK,
      codes: [ERROR_CODES_NETWORK.NETWORK_ERROR]
    });
    Notification.flashToast({
      message: isNetworkError ? 'telephony.prompt.audioConferenceNetworkError' : 'telephony.prompt.audioConferenceBackendError',
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
    return false;
  }


  joinAudioConference = async (phoneNumber: string, accessCode: string) => {
    if (this._serverTelephonyService.getAllCallCount() > 0) {
      mainLogger.warn(
        `${TelephonyService.TAG}Only allow to make one call at the same time`,
      );
      return;
    }
    const isShortNumber = await this.isShortNumber(phoneNumber);
    const ret = await this.ensureCallPermission(() => {
      return this._makeCall(phoneNumber, { accessCode })
    }, { isShortNumber });

    return ret;
  }

  transfer = async (type: TRANSFER_TYPE, transferTo: string) => {
    if (!this._callEntityId) {
      return false;
    }
    try {
      await this._serverTelephonyService.transfer(
        this._callEntityId,
        type,
        transferTo
      );
    } catch (error) {
      switch (true) {
        case CALL_ACTION_ERROR_CODE.NOT_NETWORK === error: {
          ToastCallError.toastNoNetwork();
          mainLogger.error(
            `${TelephonyService.TAG}Transfer call error: ${error.toString()}`,
          );
          return false;
        }

        default:
          ToastCallError.toastTransferError();
          mainLogger.error(
            `${TelephonyService.TAG}Transfer call error: ${error.toString()}`,
          );
          return false;
      }
    }
    return true;
  };

  private _subscribeVoicemailNotification = () => {
    this._voicemailNotificationObserver = {
      onEntitiesChanged:
        isFirefox && isWindows
          ? throttle(this._handleVoicemailEntityChanged, NOTIFY_THROTTLE_FACTOR)
          : this._handleVoicemailEntityChanged,
    };

    this._voicemailService.addEntityNotificationObserver(
      this._voicemailNotificationObserver,
    );
  }

  private _handleVoicemailEntityChanged = (voicemails: Voicemail[]) => {
    this._telephonyStore.updateVoicemailNotification(voicemails[0]);
  }

  private _subscribeMissedCallNotification = () => {
    this._callLogNotificationObserver = {
      onEntitiesChanged:
        isFirefox && isWindows
          ? throttle(this._handleMissedCallEntityChanged, NOTIFY_THROTTLE_FACTOR)
          : this._handleMissedCallEntityChanged,
    };

    this._callLogService.addEntityNotificationObserver(
      this._callLogNotificationObserver,
    );
  }

  private _handleMissedCallEntityChanged = (missedCalls: CallLog[]) => {
    this._telephonyStore.updateMissedCallNotification(missedCalls[0]);
  }
};

export { TelephonyService };
