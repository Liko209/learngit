import { SipProvisionInfo } from '../types';

export interface ITelephonyService {
  getVoipCallPermission: () => Promise<boolean>;
  getRingerDevicesList: () => MediaDeviceInfo[];
  isEmergencyAddrConfirmed: () => boolean;
  getSipProvision: () => SipProvisionInfo | undefined;
}
