import {
  BaseGlobalConfig,
  IGlobalConfigService,
  GlobalConfigService,
} from '../../../module/config';
import { ACCOUNT_KEYS } from './configKeys';

class AccountGlobalConfig extends BaseGlobalConfig {
  private static instance: AccountGlobalConfig;

  public static getInstance() {
    if (!AccountGlobalConfig.instance) {
      AccountGlobalConfig.instance = new AccountGlobalConfig(
        GlobalConfigService.getInstance() as GlobalConfigService,
      );
    }
    return AccountGlobalConfig.instance;
  }

  constructor(_configService: IGlobalConfigService) {
    super(_configService, 'account');
  }

  setCurrentUserProfileId(id: number) {
    this.put(ACCOUNT_KEYS.ACCOUNT_PROFILE_ID, id);
  }

  getCurrentUserProfileId(): number {
    const profileId = this.get(ACCOUNT_KEYS.ACCOUNT_PROFILE_ID);
    return profileId;
  }

  setCurrentCompanyId(id: number) {
    this.put(ACCOUNT_KEYS.ACCOUNT_COMPANY_ID, id);
  }

  getCurrentCompanyId() {
    const companyId = this.get(ACCOUNT_KEYS.ACCOUNT_COMPANY_ID);
    return companyId;
  }

  setCurrentUserId(id: number) {
    this.put(ACCOUNT_KEYS.ACCOUNT_USER_ID, id);
  }

  getCurrentUserId() {
    const userId = this.get(ACCOUNT_KEYS.ACCOUNT_USER_ID);
    return userId;
  }
}

export { AccountGlobalConfig };
