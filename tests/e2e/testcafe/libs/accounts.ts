/*
 * @Author: James.Xie
 * @Date: 2018-08-13 16:20:17
 * Copyright © RingCentral. All rights reserved.
 */

import * as assert from 'assert';
import { getLogger } from 'log4js';

import { AccountLockApi, AccountLockAcquire } from 'glip-account-pool-client';

const logger = getLogger(__filename);
logger.level = 'info';

interface IAccountPoolClient {
  baseUrl: string;
  envName: string;
  checkOutAccounts(accountType: string): Promise<any>;
  checkInAccounts(data: any): Promise<any>;
}

class AccountPoolClient implements IAccountPoolClient {
  accountLockApi: AccountLockApi;

  constructor(public baseUrl: string, public envName: string) {
    this.accountLockApi = new AccountLockApi(this.baseUrl);
  }

  async checkOutAccounts(accountType: string, lockTimeout: number = 30 * 60e3) {
    this.accountLockApi.basePath = this.baseUrl;
    const accountLockAcquireBody = new AccountLockAcquire();
    accountLockAcquireBody.envName = this.envName;
    accountLockAcquireBody.accountType = accountType;
    accountLockAcquireBody.expiresIn = lockTimeout;
    let acquiredAccount = undefined;
    try {
      acquiredAccount = await this.accountLockApi.accountLocksPost(accountLockAcquireBody);
    } catch (err) {
      logger.info(err.body);
    }
    assert(acquiredAccount, `acquiredAccount error: envName: ${this.envName}; accountType:${accountType}`)
    return acquiredAccount.body;
  }

  async checkInAccounts(data: any) {
    const res = await this.accountLockApi.accountLocksAccountLockIdDelete(
      data.accountLockId,
    );
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
    return data;
  }

  async checkInAccounts(data: any) {
    assert(this.availableAccounts[data.accountType] !== undefined);
    this.availableAccounts[data.accountType].push(data);
  }

  async checkInAll() {
    // this method should never fail!
    for (const data of this.allAccounts) {
      try {
        const ret = await this.accountPoolClient.checkInAccounts(data);
        logger.info(`success to reclaim account: ${data.companyEmailDomain}`);
      } catch (err) { }
    }
  }
}

function initAccountPoolManager(ENV_OPTS, DEBUG_MODE) {
  const _accountPoolUrl = DEBUG_MODE
    ? ENV_OPTS.ACCOUNT_POOL_FOR_DEBUG_BASE_URL
    : ENV_OPTS.ACCOUNT_POOL_BASE_URL;
  const _accountPoolClient = new AccountPoolClient(
    _accountPoolUrl,
    ENV_OPTS.ACCOUNT_POOL_ENV,
  );
  const accountPoolClient = new AccountPoolManager(_accountPoolClient);

  // ensure account pool clean up on key interrupt
  ['SIGINT', 'SIGTERM',].forEach((e: any) => {
    process.on(e, () => {
      logger.info(`release account on ${e}`);
      accountPoolClient.checkInAll()
        .then(() => {
          logger.info('release account done');
        });
    });
  });
  return accountPoolClient;
}

export { IAccountPoolClient, initAccountPoolManager };
