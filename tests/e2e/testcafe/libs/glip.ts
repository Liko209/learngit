/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-17 14:31:09
 * Copyright © RingCentral. All rights reserved.
 */

import Ringcentral from 'ringcentral-js-concise';

type IdType= number | string;

export interface IAccount {
  rc_id: IdType,
  glip_id: IdType,
  name: string,
  email: string,
  number: string,
  extension: string,
  password: string,
}

export class RcPlatformHelper {

  username: string;
  extension: string;
  password: string

  sdk: any;
  constructor(sdk: any, username: string, extension: string, password: string) {
    this.sdk = sdk;
    this.username = username;
    this.extension = extension;
    this.password = password;
  }

  async auth() {
    await this.sdk.authorize({
      username: this.username,
      extension: this.extension,
      password: this.password
    });
    this.sdk.autoRefresh = true;
  }

  async sendPost(groupId: IdType, data: any) {
    const url = `/restapi/v1.0/glip/groups/${groupId}/posts`;
    return await this.sdk.post(url, data);
  }
}

export class RcPlatformManager {

  clients: object;

  constructor(
    private platformKey: string,
    private platformSecret: string,
    private platformUrl: string) {
    this.clients = {};
  }

  createClient(account: IAccount): RcPlatformHelper {
    const sdk = new Ringcentral(this.platformKey, this.platformSecret, this.platformUrl);
    return new RcPlatformHelper(sdk, account.number, account.extension, account.password);
  }

  async getClient(account: IAccount){
    let client: RcPlatformHelper = this.clients[account.glip_id];
    if (client == undefined) {
      client = this.createClient(account);
      await client.auth();
      this.clients[account.glip_id] = client;
    }
    return client;
  }
}
