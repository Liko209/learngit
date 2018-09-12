/*
 * @Author: James.Xie
 * @Date: 2018-08-13 16:20:17
 * Copyright © RingCentral. All rights reserved.
 */

import * as assert from 'assert';
import { AccountOperationsApi as AccountPoolApi } from 'account-pool-ts-api';
import {
  AccountLockApi,
  AccountLockAcquire,
} from 'glip-account-pool-client';

import { ENV, DEBUG } from '../config';
interface IAccountPoolClient {
  baseUrl: string;
  envName: string;
  checkOutAccounts(accountType: string): Promise<any>;
  checkInAccounts(data: any): Promise<any>;
}

function releaseCommandBuilder(url: string, accountLockId: string) {
  return (
    `curl -X DELETE "${url}/accountLocks/${accountLockId}" -H "accept: application/json"`
  );
}

class AccountPoolClient implements IAccountPoolClient {
  accountLockApi: AccountLockApi;

  constructor(public baseUrl: string, public envName: string) {
    this.accountLockApi = new AccountLockApi(this.baseUrl);
  }

  async checkOutAccounts(accountType: string) {
    this.accountLockApi.basePath = this.baseUrl;
    const accountLockAcquireBody = new AccountLockAcquire();
    accountLockAcquireBody.envName = this.envName;
    accountLockAcquireBody.accountType = accountType;
    const acquiredAccount = await this.accountLockApi.accountLocksPost(accountLockAcquireBody);
    return acquiredAccount.body;
  }

  async checkInAccounts(data: any) {
    const res = await this.accountLockApi.accountLocksAccountLockIdDelete(data.accountLockId);
    return res.body;
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
    console.log('Account Pool: in case of unexpected error, you can use following command to reclaim account');
    console.log(releaseCommandBuilder(this.baseUrl, data.accountLockId));
    return data;
  }

  async checkInAccounts(data: any) {
    assert(this.availableAccounts[data.accountType] !== undefined);
    this.availableAccounts[data.accountType].push(data);
  }

  async checkInAll() {
    console.log('Account Pool: following accounts are used in this run:');
    console.log(JSON.stringify(this.allAccounts));
    for (const data of this.allAccounts) {
      const ret = await this.accountPoolClient.checkInAccounts(data);
      console.log('release result:', ret);
      console.log(`Account Pool: success to reclaim account: ${data.companyEmailDomain}`);
    }
  }
}

const _accountPoolUrl = DEBUG ? ENV.ACCOUNT_POOL_FOR_DEBUG_BASE_URL : ENV.ACCOUNT_POOL_BASE_URL;
const _accountPoolClient = new AccountPoolClient(_accountPoolUrl, ENV.ACCOUNT_POOL_ENV);
const accountPoolClient = new AccountPoolManager(_accountPoolClient);

export { accountPoolClient };
