import axios, { AxiosInstance } from 'axios';
import * as querystring from 'querystring';

import { RcPlatformSdk } from './platform';
import _ = require('lodash');

export class GlipSdk {
  axiosClient: AxiosInstance;
  accessToken: string;
  initData: any;

  constructor(private glipServerUrl: string, private platform: RcPlatformSdk) {
    this.axiosClient = axios.create({
      baseURL: this.glipServerUrl,
    });
  }

  async authByRcToken(forMobile: boolean = false) {
    const encodedToken = Buffer.from(
      JSON.stringify(this.platform.token),
    ).toString('base64');
    const url = 'api/login';
    const data: any = {
      remember_me: false,
      rc_access_token_data: encodedToken,
    };
    if (forMobile) {
      data.for_mobile = forMobile;
    }
    return await this.axiosClient.put(url, querystring.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-RC-Access-Token-Data': encodedToken,
      },
    });
  }

  get headers() {
    return {
      Authorization: 'Bearer ' + this.accessToken,
    };
  }

  get myId() {
    return this.initData.user_id;
  }

  async auth(forMobile: boolean = true) {
    const res = await this.authByRcToken(forMobile);
    this.accessToken = res.headers['x-authorization'];
    this.initData = res.data;
  }

  getPerson(personId: string) {
    const uri = `api/person/${personId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updatePerson(personId: string, personDict: object) {
    personId = personId || this.initData.user_id;

    const uri = `api/person/${personId}`;
    return this.axiosClient.put(uri, personDict, {
      headers: this.headers,
    });
  }

  deactivated(personId: string) {
    this.updatePerson(personId, { deactivated: true });
  }

  getTeams() {
    const uri = 'api/teams';
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  createTeam(name: string, memebersByGlipId: number[]) {
    const uri = 'api/team';
    const data = {
      is_team: true,
      is_public: false,
      members: memebersByGlipId,
      set_abbreviation: name,
    };
    return this.axiosClient.post(uri, data, {
      headers: this.headers,
    });
  }

  getTeam(groupId) {
    const uri = `/api/group/${groupId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateGroup(groupId, data: object) {
    const uri = `/api/group/${groupId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  modifyGroupName(groupId, name) {
    const uri = `/api/group/${groupId}`;
    const data = { set_abbreviation: name };
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  sendPost(groupId: number, text: string) {
    const uri = 'api/post';
    const data = {
      group_id: groupId,
      is_new: true,
      is_sms: true,
      text,
    };
    return this.axiosClient.post(uri, data, {
      headers: this.headers,
    });
  }

  getProfile(profileId: string) {
    const uri = `api/profile/${profileId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  async getProfileByGlipId(glipId: string) {
    const profileId = await this.getProfileIdByPersonId(glipId);
    return await this.getProfile(profileId);
  }

  updateProfile(profileId: string, data: object) {
    const uri = `api/profile/${profileId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  getState(stateId: string) {
    const uri = `api/state/${stateId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateState(stateId: string, data: object) {
    const uri = `api/state/${stateId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  partialUpdateState(stateId: string, data: object) {
    const uri = `api/save_state_partial/${stateId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  async markAsRead(personId: string, groupIds: string[]) {
    if (!groupIds.length) return;
    const readThrough = {};
    for (let i = 0; i < groupIds.length; i++) {
      const id = groupIds[i];
      const group = await this.getTeam(id);
      readThrough[id] = group.data.most_recent_post_id;
    }
    const params = _.assign(
      {},
      ...groupIds.map(id => ({
        [`unread_count:${id}`]: 0,
        [`unread_mentions_count:${id}`]: 0,
        [`unread_deactivated_count:${id}`]: 0,
        [`read_through:${id}`]: readThrough[id],
        [`marked_as_unread:${id}`]: false,
      })),
    );

    const stateId = await this.getStateIdByPersonId(personId);
    await this.partialUpdateState(stateId, params);
  }

  async getIdsOfGroupsWithUnreadMessages(personId: string) {
    const stateId = await this.getStateIdByPersonId(personId);

    const state = (await this.getState(stateId)).data;
    const unreadGroups = Object.keys(state)
      .filter((key: string) => {
        return (
          (/unread_count:/.test(key) || /unread_mentions_count:/.test(key)) &&
          state[key] > 0
        );
      })
      .map((key: string) => key.replace(/[^\d]+/, ''));

    return unreadGroups;
  }

  async updateProfileByGlipId(glipId, data: object) {
    const profileId = await this.getProfileIdByPersonId(glipId);
    return await this.updateProfile(profileId, data);
  }

  async getProfileIdByPersonId(personId: string) {
    return (await this.getPerson(personId)).data.profile_id;
  }

  async getStateIdByPersonId(personId: string) {
    return (await this.getPerson(personId)).data.state_id;
  }

  async updateStateByGlipId(glipId, data: object) {
    const stateId = await this.getStateIdByPersonId(glipId);
    return await this.updateState(stateId, data);
  }

  async skipCloseConversationConfirmation(personId: string, value: boolean) {
    const profileId = await this.getProfileIdByPersonId(personId);
    const data: object = { skip_close_conversation_confirmation: value };
    return await this.updateProfile(profileId, data);
  }
}
