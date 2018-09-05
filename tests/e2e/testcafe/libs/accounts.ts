/*
 * @Author: James.Xie
 * @Date: 2018-08-13 16:20:17
 * Copyright © RingCentral. All rights reserved.
 */

import * as assert from 'assert';
import { AccountOperationsApi as AccountPoolApi } from 'account-pool-ts-api';
import { ENV } from '../config';
interface IAccountPoolClient {
  baseUrl: string;
  envName: string;
  checkOutAccounts(accountType: string): Promise<any>;
  checkInAccounts(data: any): Promise<any>;
}

function releaseCommandBuilder(url: string, env: string, accountType: string, domain: string) {
  return (
    `curl -X PUT ${url}/account/${env}/${accountType} -H 'Content-Type: application/x-www-form-urlencoded' ` +
    `-d 'action=release&companyEmailDomain=${domain}'`
  );
}

class AccountPoolClient implements IAccountPoolClient {

  constructor(public baseUrl: string, public envName: string, private client: AccountPoolApi = new AccountPoolApi()) {
  }

  async checkOutAccounts(accountType: string) {
    const response = await this.client.snatchAccount(this.envName, accountType, undefined, 'false');
    return response.body;
  }

  async checkInAccounts(data: any) {
    await this.client.releaseAccount(this.envName, data.accountType, data.companyEmailDomain);
  }
}

class AccountPoolManager implements IAccountPoolClient {

  availableAccounts: any;
  allAccounts: any[];
  baseUrl: string;
  envName: string;

  constructor(private accountPoolClient: IAccountPoolClient) {
    this.baseUrl = accountPoolClient.baseUrl;
    this.envName = accountPoolClient.envName;
    this.availableAccounts = {};
    this.allAccounts = [];
  }

  async checkOutAccounts(accountType: string) {
    if (this.availableAccounts[accountType] === undefined) {
      this.availableAccounts[accountType] = [];
    }
    const fifo: any[] = this.availableAccounts[accountType];
    if (fifo.length > 0) {
      return fifo.shift();
    }
    const data = await this.accountPoolClient.checkOutAccounts(accountType);
    this.allAccounts.push(data);
    console.log('In case of unexpected error, you can use following command to reclaim account');
    console.log(releaseCommandBuilder(this.baseUrl, this.envName, accountType, data.companyEmailDomain));
    return data;
  }

  async checkInAccounts(data: any) {
    assert(this.availableAccounts[data.accountType] !== undefined);
    this.availableAccounts[data.accountType].push(data);
  }

  async checkInAll() {
    console.log('Account Pool: following accounts are used in this run:');
    console.log(this.allAccounts);
    for (const data of this.allAccounts) {
      await this.accountPoolClient.checkInAccounts(data);
      console.log(`Account Pool: success to reclaim account: ${data.companyEmailDomain}`);
    }
  }
}

const accountPoolClient = new AccountPoolManager(
  new AccountPoolClient(ENV.ACCOUNT_POOL_BASE_URL, ENV.ACCOUNT_POOL_ENV),
);

export { accountPoolClient };
