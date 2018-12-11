import { RTCAccountManager } from '../account/rtcAccountManager';

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
  private _accountManager: RTCAccountManager;

  constructor(listener: IRTCAccountListener) {
    console.log('RTCAccout created');
    this._accountManager = new RTCAccountManager(listener);
  }

  public deRegister() {
    this._accountManager.deRegister();
  }
}

export { AccountState, IRTCAccountListener, RTCAccount };
