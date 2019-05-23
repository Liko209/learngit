import { AxiosError } from 'axios';
import * as _ from 'lodash';
import { getLogger } from 'log4js';
import Ringcentral from 'ringcentral-js-concise';
import * as fs from 'fs';
import * as path from 'path';

import { MiscUtils } from "../utils";
import { ICredential } from "../models";

const logger = getLogger(__filename);
logger.level = 'info';

export class RcPlatformSdk {
  private sdk: any;

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
      logger.error('auth failed: ', err.response, err.response.data);
      return false;
    });
  }

  constructor(key, secret, url, private credential: ICredential) {
    this.sdk = new Ringcentral(key, secret, url);
  }

  get token() {
    return this.sdk._token;
  }

  async init() {
    try {
      await this.sdk.authorize(this.credential);
    } catch (e) {
      logger.error('auth failed: ', e.response, e.response.data);
      throw e;
    }
  }

  async refresh() {
    return await this.init();
  }

  async createExtension(data: any, accountId: string = '~') {
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

  async createGroup(data: any) {
    const url = 'restapi/v1.0/glip/groups';
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, data);
    });
  }

  async createTeam(data: any) {
    const url = 'restapi/v1.0/glip/teams';
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, data);
    });
  }

  async updateTeam(data: any, chatId: string) {
    const url = `restapi/v1.0/glip/teams/${chatId}`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.patch(url, data);
    });
  }

  async leaveTeam(chatId: string) {
    const url = `restapi/v1.0/glip/teams/${chatId}/leave`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url);
    });
  }

  async deleteTeam(chatId: string) {
    const url = `restapi/v1.0/glip/teams/${chatId}`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.delete(url);
    });
  }

  async archiveTeam(chatId: string) {
    const url = `restapi/v1.0/glip/teams/${chatId}/archive`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url);
    });
  }

  async unArchiveTeam(chatId: string) {
    const url = `restapi/v1.0/glip/teams/${chatId}/unarchive`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url);
    });
  }

  async joinTeam(chatId: string) {
    const url = `restapi/v1.0/glip/teams/${chatId}/join`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url);
    });
  }

  async addTeamMember(data: any, chatId: string) {
    return await this.editGroupMembers({
      addedPersonIds: data.map(member => member.id),
    }, chatId);
    // fixme: using following code after glpa upgrade to latest
    const url = `restapi/v1.0/glip/teams/${chatId}/add`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, data);
    });
  }

  async removeTeamMember(data: any, chatId: string) {
    return await this.editGroupMembers({
      removedPersonIds: data.map(member => member.id),
    }, chatId);
    // fixme: using following code after glpa upgrade to latest
    const url = `restapi/v1.0/glip/teams/${chatId}/remove`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, data);
    });
  }

  async editGroupMembers(data: any, chatId: string) {
    const url = `restapi/v1.0/glip/groups/${chatId}/bulk-assign`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, data);
    });
  }

  async createOrOpenChat(data: any) {
    const url = `restapi/v1.0/glip/conversations`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, data);
    });
  }

  async addChatToFavorites(chatId: string) {
    const url = `restapi/v1.0/glip/chats/${chatId}/favorite`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url);
    });
  }

  async removeChatToFavorites(chatId: string) {
    const url = `restapi/v1.0/glip/chats/${chatId}/unfavorite`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url);
    });
  }

  async markChatAsRead(chatId: string) {
    const url = `/restapi/v1.0/glip/chats/${chatId}/read`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url);
    });
  }

  async uploadFile(filePath: string, name?: string, groupId?: string) {
    const url = `restapi/v1.0/glip/files`;
    const content = fs.readFileSync(filePath);
    if (!name) name = path.basename(filePath);
    const params = _.pickBy({ groupId, name }, _.identity);
    return await this.retryRequestOnException(async () => {
      return await this.sdk.post(url, content, {
        'Content-Type': 'application/octet-stream',
        params,
      });
    });
  }

  async createPostWithTextAndFiles(groupId: string, filePaths: string | string[], text?: string, fileNames?: string | string[]) {
    filePaths = [].concat(filePaths);
    fileNames = [].concat(fileNames);
    let attachments = [];
    for (const i in filePaths) {
      const fileData = await this.uploadFile(filePaths[i], fileNames[i]).then(res => res.data); // return array(length =1)
      const file = _.merge(fileData[0], { type: "File" });
      attachments.push(file);
    }
    const data = _.pickBy({ text, attachments }, _.identity);
    return await this.createPost(data, groupId);
  }

  async createPostWithTextAndFilesThenGetPostId(groupId: string, filePaths: string | string[], text?: string, fileNames?: string | string[]) {
    return await this.createPostWithTextAndFiles(groupId, filePaths, text, fileNames).then(res => res.data.id);
  }

  // deprecated
  async createAndGetGroupId(data: any) {
    return await this.createGroup(data).then(res => res.data.id);
  }

  async sentAndGetTextPostId(text: string, groupId: string) {
    return await this.sendTextPost(text, groupId).then(res => res.data.id);
  }

  /** phone number */
  async getExtensionPhoneNumberList(){
    const url = `/restapi/v1.0/account/~/extension/~/phone-number`;
    return await this.retryRequestOnException(async () => {
      return await this.sdk.get(url);
    });
  }
}
