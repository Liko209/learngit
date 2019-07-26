import { EmergencyServiceAddress, SipProvisionInfo } from '../types';

export interface ITelephonyService {
  getVoipCallPermission: () => Promise<boolean>;
  getRingerDevicesList: () => MediaDeviceInfo[];
  getEmergencyAddress: () => EmergencyServiceAddress | undefined;
  isEmergencyAddrConfirmed: () => boolean;
  getSipProvision: () => SipProvisionInfo | undefined;
}
