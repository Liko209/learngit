import { EmergencyServiceAddress } from '../types';

export interface ITelephonyService {
  getVoipCallPermission: () => Promise<boolean>;
  getRingerDevicesList: () => MediaDeviceInfo[];
  getEmergencyAddress: () => EmergencyServiceAddress | undefined;
}
