export interface ITelephonyService {
  getVoipCallPermission: () => Promise<boolean>;
}
