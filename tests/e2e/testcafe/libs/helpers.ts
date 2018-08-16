import accountPoolHelper from './AccountPoolHelper';
import { ENV } from '../config';

export function setUp(accountType: string) {
  return async (t: TestController) => {
    t.ctx.data = await accountPoolHelper.checkOutAccounts(ENV.ACCOUNT_POOL_ENV, accountType);
  }
}

export function tearDown() {
  return async (t: TestController) => {
    await accountPoolHelper.checkInAccounts(ENV.ACCOUNT_POOL_ENV, t.ctx.data.accountType, t.ctx.data.companyEmailDomain);
  }
}
