import { TelephonyDataCollectionInfoConfigType } from '../types';

export interface ITelephonyService {
  getVoipCallPermission: () => Promise<boolean>;
  getRingerDevicesList: () => MediaDeviceInfo[];
  isEmergencyAddrConfirmed: () => boolean;
  setDataCollectionInfoConfig: (
    info: TelephonyDataCollectionInfoConfigType,
  ) => void;
}
