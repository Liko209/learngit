import { RTCRegistrationManager } from '../account/rtcRegistrationManager';

enum AccountState {
  IDEL,
  REGISTERED,
  FAILED,
  UNREGISTERED,
  IN_PROGRESS,
}

interface IRTCAccountListener {
  onAccountStateChanged(state: AccountState): void;
}

class RTCAccount {
  private _registrationManager: RTCRegistrationManager;

  constructor(listener: IRTCAccountListener) {
    console.log('RTCAccout created');
    this._registrationManager = new RTCRegistrationManager(listener);
  }

  public deRegister() {
    this._registrationManager.deRegister();
  }
}

export { AccountState, IRTCAccountListener, RTCAccount };
