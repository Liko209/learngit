/*
 * @Author: James.Xie
 * @Date: 2018-08-13 16:20:17
 * Copyright © RingCentral. All rights reserved.
 */

import { AccountOperationsApi as AccountPoolApi } from 'account-pool-ts-api';
import * as assert from 'assert';
interface IAccountPoolClient {
  checkOutAccounts(accountType: string): Promise<any>;
  checkInAccounts(data: any): Promise<any>;
}

export class AccountPoolClient implements IAccountPoolClient {

  constructor(private envName: string, private client: AccountPoolApi = new AccountPoolApi()) {
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

  objectPool: any;

  constructor(private accountPoolClient: IAccountPoolClient) {
    this.objectPool = {};
  }

  async checkOutAccounts(accountType: string) {
    if (this.objectPool[accountType] === undefined) {
      this.objectPool[accountType] = [];
    }
    const fifo: any[] = this.objectPool[accountType];
    if (fifo.length > 0) {
      return fifo.shift();
    }
    return await this.accountPoolClient.checkOutAccounts(accountType);
  }

  async checkInAccounts(data: any) {
    assert(this.objectPool[data.accountType] !== undefined);
    this.objectPool[data.accountType].push(data);
  }

  async checkInAll() {
    console.log('Account Pool: following accounts are used in this run');
    console.log(this.objectPool);
    for (const accountType in this.objectPool) {
      for (const data of this.objectPool[accountType]) {
        await this.accountPoolClient.checkInAccounts(data);
      }
    }
  }
}
