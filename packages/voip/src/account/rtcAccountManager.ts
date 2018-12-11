import { RTCAccountFSM, IConditionalHandler } from './rtcAccountFSM';
import { IRTCAccountListener, AccountState } from '../api/rtcAccount';

// const WebPhone = require('ringcentral-web-phone');

class RTCAccountManager implements IConditionalHandler {
  private _fsm: RTCAccountFSM;
  // private _webPhone: any;
  private _listener: IRTCAccountListener;

  processReadyOnRegSucceed(): string {
    return 'ready';
  }

  processReadyOnNetworkChanged(): string {
    return 'ready';
  }

  constructor(listener: IRTCAccountListener) {
    this._listener = listener;
    this._fsm = new RTCAccountFSM(this);
    this._fsm.observe('onReady', () => {
      this._listener.onAccountStateChanged(AccountState.REGISTERED);
    });
    this._fsm.observe('onRegInProgress', () => {
      this._listener.onAccountStateChanged(AccountState.IN_PROGRESS);
    });
    this._fsm.observe('onNone', () => {
      this._listener.onAccountStateChanged(AccountState.UNREGISTERED);
    });
    this._fsm.observe('onUnRegInProgress', () => {
      this._listener.onAccountStateChanged(AccountState.IN_PROGRESS);
    });
    this._fsm.observe('onRegFailure', () => {
      this._listener.onAccountStateChanged(AccountState.FAILED);
    });
  }

  public deRegister() {
    this._fsm.deRegister();
    // this._webPhone.userAgent.unregister();
  }
  /*
  private _onRegistered() {
    this._fsm.regSucceed();
  }

  private _onUnRegistered() {
    console.log('_onUnRegistered');
    this._fsm.deRegSucceed();
  }

  private _onRegistrationFailed() {
    console.log('_onRegistrationFailed');
    this._fsm.regError();
  }

  private _onRegistrationInProgress() {
    console.log('_onRegistrationInProgress');
  }

  private _onRegistrationAccepted() {
    console.log('_onRegistrationAccepted');
  }

  public handleProvisioning(sipData: any, params: any) {
    const info = {
      appKey: params.appKey,
      appName: params.appName,
      appVersion: params.appVersion,
      endPointId: params.endPointId,
      logLevel: 10,
      audioHelper: {
        enabled: true,
      },
      media: {},
    };
    info.appKey = params.appKey;
    this._fsm.doRegister();
    this._webPhone = new WebPhone(sipData, info);
    this._webPhone.userAgent.on('registered', this._onRegistered.bind(this));
    this._webPhone.userAgent.on(
      'unregistered',
      this._onUnRegistered.bind(this),
    );
    this._webPhone.userAgent.on(
      'registrationFailed',
      this._onRegistrationFailed.bind(this),
    );
    this._webPhone.userAgent.on(
      'progress',
      this._onRegistrationInProgress.bind(this),
    );
    this._webPhone.userAgent.on(
      'accepted',
      this._onRegistrationAccepted.bind(this),
    );
  }*/
}

export { RTCAccountManager };
