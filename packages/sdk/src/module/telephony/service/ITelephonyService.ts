export interface ITelephonyService {
  getVoipCallPermission: () => Promise<boolean>;
  getRingerDevicesList: () => MediaDeviceInfo[];
  isEmergencyAddrConfirmed: () => boolean;
}
