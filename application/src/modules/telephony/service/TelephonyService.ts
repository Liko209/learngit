/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 13:42:30
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework';
import {
  TelephonyService as ServerTelephonyService,
  RTC_ACCOUNT_STATE,
  RTC_CALL_STATE,
} from 'sdk/module/telephony';
import { PersonService, ContactType } from 'sdk/module/person';
import { mainLogger } from 'sdk';
import { TelephonyStore } from '../store';

class TelephonyService {
  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;

  private _serverTelephonyService: ServerTelephonyService = ServerTelephonyService.getInstance();
  private _personService: PersonService = PersonService.getInstance();

  private _callId?: string;

  private _registeredOnbeforeunload: boolean = false;

  private _onAccountStateChanged = (state: RTC_ACCOUNT_STATE) => {
    mainLogger.debug(`[Telephony_Service_Account_State]: ${state}`);
  }

  private _onMadeOutgoingCall = (callId: string) => {};

  private _onCallStateChange = (callId: string, state: RTC_CALL_STATE) => {
    mainLogger.debug(`[Telephony_Service_Call_State]: ${state}`);

    this._callId = callId;
    switch (state) {
      case RTC_CALL_STATE.CONNECTED: {
        this._telephonyStore.connected();
        break;
      }
      case RTC_CALL_STATE.DISCONNECTED: {
        this._telephonyStore.end();
        break;
      }
    }
  }

  constructor() {
    this._serverTelephonyService.createAccount({
      onAccountStateChanged: this._onAccountStateChanged,
      onMadeOutgoingCall: this._onMadeOutgoingCall,
    });
  }

  makeCall = (toNumber: string) => {
    this._telephonyStore.phoneNumber = toNumber;
    this._serverTelephonyService.makeCall(toNumber, {
      onCallStateChange: this._onCallStateChange,
    });

    // TODO: There is a LeaveBlockerService, but it can't support multi-blocker. When it can support, we should use that service.
    if (!this._registeredOnbeforeunload) {
      // If makeCall return success, register this handle
      window.addEventListener(
        'beforeunload',
        (e: Event) => {
          e.preventDefault();
          if (this._serverTelephonyService.getAllCallCount() > 0) {
            mainLogger.info(
              `Notify user has call count: ${this._serverTelephonyService.getAllCallCount()}`,
            );
            const confirmationMessage = true;

            (e || window.event).returnValue = confirmationMessage; // Gecko + IE
            return confirmationMessage;
          }
          // if we return nothing here (just calling return;) then there will be no pop-up question at all
          return;
        },
        false,
      );
      this._registeredOnbeforeunload = true;
    }
  }

  directCall = (toNumber: string) => {
    this.makeCall(toNumber);
    this._telephonyStore.directCall();
  }

  hangUp = () => {
    if (this._callId) {
      this._serverTelephonyService.hangUp(this._callId);
    }
  }

  minimize = () => {
    this._telephonyStore.closeDialer();
  }

  handleWindow = () => {
    if (this._telephonyStore.isDetached) {
      this._telephonyStore.attachedWindow();
      return;
    }
    this._telephonyStore.detachedWindow();
  }

  matchContactByPhoneNumber = async (phone: string) => {
    return await this._personService.matchContactByPhoneNumber(
      phone,
      ContactType.GLIP_CONTACT,
    );
  }
}

export { TelephonyService };
