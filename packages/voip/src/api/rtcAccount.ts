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

  public handleProvisioning(sipData: any, params: any) {
    this._accountManager.handleProvisioning(sipData, params);
  }

  // public deRegister() {
  //   this._accountManager.deRegister();
  // }
}

export { AccountState, IRTCAccountListener, RTCAccount };
