import { AxiosError } from 'axios';
import * as _ from 'lodash';
import { getLogger } from 'log4js';

import { MiscUtils } from "../utils";
import { ICredential } from "../models";

const logger = getLogger(__filename);

export class RcPlatformSdk {

  async retryRequestOnException(cb: () => Promise<any>) {
    return await MiscUtils.retryAsync(cb, async (err: AxiosError) => {
      if (429 == err.response.status) {
        logger.warn('retry request on 429 after 90 seconds');
        await MiscUtils.sleep(90e3);
        return true;
      }
      if (401 == err.response.status) {
        logger.info('refresh token and retry request on 401');
        await this.refresh();
        return true;
      }
      return false;
    });
  }

  constructor(private sdk: any, private credential: ICredential) { }

  get token() {
    return this.sdk._token;
  }

  async init() {
    await this.sdk.authorize(this.credential);
  }

  async refresh() {
    return await this.init();
  }

  async createExtension(data: object, accountId: string = '~') {
    const url = `restapi/v1.0/account/${accountId}/extension`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, data);
    });
  }

  async createPost(data: any, groupId: string) {
    const url = `restapi/v1.0/glip/groups/${groupId}/posts`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, data);
    });
  }

  async sendTextPost(text: string, groupId: string) {
    const data = { text };
    return await this.createPost(data, groupId);
  }

  async createGroup(data: object) {
    const url = 'restapi/v1.0/glip/groups';
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, data);
    });
  }

  async createTeam(data: object) {
    const url = 'restapi/v1.0/glip/teams';
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, data);
    });
  }

  // deprecated
  async createAndGetGroupId(data: object) {
    return await this.createGroup(data).then(res => res.data.id);
  }

  async sentAndGetTextPostId(text: string, groupId: string) {
    return await this.sendTextPost(text, groupId).then(res => res.data.id);
  }
}
