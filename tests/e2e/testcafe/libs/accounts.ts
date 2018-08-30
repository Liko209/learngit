/*
 * @Author: James.Xie
 * @Date: 2018-08-13 16:20:17
 * Copyright © RingCentral. All rights reserved.
 */

import { AccountOperationsApi as AccountPool } from 'account-pool-ts-api';

class AccountPoolHelper {
  accountPoolClient: AccountPool;

  constructor() {
    this.accountPoolClient = new AccountPool();
  }

  async checkOutAccounts(envName: string, accountType: string, isDebug: string = 'false') {
    const response = await this.accountPoolClient.snatchAccount(envName, accountType, undefined, isDebug);
    return response.body;
  }

  async checkInAccounts(envName: string, accountType: string, companyEmailDomain: string) {
    await this.accountPoolClient.releaseAccount(envName, accountType, companyEmailDomain);
  }
}

const accountPoolHelper = new AccountPoolHelper();

export default accountPoolHelper;
