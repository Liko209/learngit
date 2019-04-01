import { ACCOUNT_KEYS } from './configKeys';
import { UserConfig } from '../../../module/config';
import { AccountGlobalConfig } from './AccountGlobalConfig';

class AccountUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getUserDictionary(), 'account');
  }

  getUnreadToggleSetting() {
    return this.get(ACCOUNT_KEYS.UNREAD_TOGGLE_ON);
  }

  setUnreadToggleSetting(value: boolean) {
    this.put(ACCOUNT_KEYS.UNREAD_TOGGLE_ON, value);
  }

  setCurrentCompanyId(id: number) {
    this.put(ACCOUNT_KEYS.ACCOUNT_COMPANY_ID, id);
  }

  getCurrentCompanyId() {
    const companyId = this.get(ACCOUNT_KEYS.ACCOUNT_COMPANY_ID);
    return companyId;
  }

  getClientId() {
    return this.get(ACCOUNT_KEYS.CLIENT_ID);
  }

  setClientId(id: number) {
    this.put(ACCOUNT_KEYS.CLIENT_ID, id);
  }

  setClientConfig(config: any) {
    this.put(ACCOUNT_KEYS.ACCOUNT_CLIENT_CONFIG, config);
  }

  getClientConfig() {
    return this.get(ACCOUNT_KEYS.ACCOUNT_CLIENT_CONFIG);
  }

  setCurrentUserProfileId(id: number) {
    this.put(ACCOUNT_KEYS.ACCOUNT_PROFILE_ID, id);
  }

  getCurrentUserProfileId(): number {
    const profileId = this.get(ACCOUNT_KEYS.ACCOUNT_PROFILE_ID);
    return profileId;
  }

  getGlipUserId() {
    return this.get(ACCOUNT_KEYS.GLIP_USER_ID);
  }

  setGlipUserId(id: number) {
    this.put(ACCOUNT_KEYS.GLIP_USER_ID, id);
  }

  setAccountType(accountType: string) {
    this.put(ACCOUNT_KEYS.ACCOUNT_TYPE, accountType);
  }

  getAccountType() {
    return this.get(ACCOUNT_KEYS.ACCOUNT_TYPE);
  }
}

export { AccountUserConfig };
