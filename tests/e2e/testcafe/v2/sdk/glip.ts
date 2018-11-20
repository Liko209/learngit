import * as assert from 'assert';
import * as querystring from 'querystring';

import _ = require('lodash');
import axios, { AxiosInstance } from 'axios';

import { RcPlatformSdk } from './platform';

interface Person {
  _id: number;
  rc_extension_id: number;
}

interface Profile {
  _id: number;
  person_id: number;
}

interface State {
  _id: number;
  person_id: number;
}

interface InitData {
  user_id: number;
  people: Person[];
  profile: Profile;
  state: State;
}

export class GlipDb {
  personIdIndexByRcId: { [id: string]: number };
  rcIdIndexByPersonId: { [id: number]: string };
  profileIdIndexByPersonId: { [id: number]: number };
  stateIdIndexByPersonId: { [id: number]: number };

  constructor() {
    this.personIdIndexByRcId = {};
    this.rcIdIndexByPersonId = {};
    this.profileIdIndexByPersonId = {};
    this.stateIdIndexByPersonId = {};
  }

  updateWithInitData(initData: InitData) {
    for (const person of initData.people) {
      this.personIdIndexByRcId[String(person.rc_extension_id)] = person._id;
      this.rcIdIndexByPersonId[person._id] = String(person.rc_extension_id);
    }
    this.profileIdIndexByPersonId[initData.profile.person_id] = initData.profile._id;
    this.stateIdIndexByPersonId[initData.state.person_id] = initData.state._id;
  }

  toPersonId(rcId: string | string[]) {
    if (typeof rcId === 'string') {
      const personId = this.personIdIndexByRcId[rcId];
      assert(personId, `person id of rc extension ${rcId} is not existed!`);
      return personId;
    }
    return rcId.map(id => this.toPersonId(id));
  }

  toProfileId(rcId: string | string[]) {
    if (typeof rcId === 'string') {
      const personId = this.personIdIndexByRcId[rcId];
      assert(personId, `person id of rc extension ${rcId} is not existed!`);
      const profileId = this.profileIdIndexByPersonId[personId];
      assert(profileId, `profile id of rc extension ${rcId} is not existed!`);
      return profileId;
    }
    return rcId.map(id => this.toProfileId(id));
  }

  toStateId(rcId: string | string[]) {
    if (typeof rcId === 'string') {
      const personId = this.personIdIndexByRcId[rcId];
      assert(personId, `person id of rc extension ${rcId} is not existed!`);
      const stateId = this.stateIdIndexByPersonId[personId];
      assert(stateId, `state id of rc extension ${rcId} is not existed!`);
      return stateId;
    }
    return rcId.map(id => this.toStateId(id));
  }
}

export class GlipSdk {
  axiosClient: AxiosInstance;
  accessToken: string;
  initData: InitData;

  constructor(private glipServerUrl: string, private platform: RcPlatformSdk, private glipDb?: GlipDb) {
    this.axiosClient = axios.create({
      baseURL: this.glipServerUrl,
    });
    this.glipDb = glipDb || new GlipDb();
  }

  toPersonId(rcId: string | string[]) {
    return this.glipDb.toPersonId(rcId)
  }

  toProfileId(rcId: string | string[]) {
    return this.glipDb.toProfileId(rcId)
  }

  toStateId(rcId: string | string[]) {
    return this.glipDb.toStateId(rcId)
  }

  get myPersonId() {
    return this.initData.user_id;
  }

  get myProfile() {
    return this.initData.profile;
  }

  get myState() {
    return this.initData.state;
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

  async auth() {
    const res = await this.authByRcToken(true);
    this.accessToken = res.headers['x-authorization'];
    this.initData = res.data;
    this.glipDb.updateWithInitData(this.initData);
  }

  /* person */
  getPerson(rcId?: string) {
    const personId = rcId ? this.toPersonId(rcId) : this.myPersonId;
    const uri = `api/person/${personId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updatePerson(rcId: string, data) {
    const personId = rcId ? this.toPersonId(rcId) : this.myPersonId;
    const uri = `api/person/${personId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }


  /* team */
  getTeams() {
    const uri = 'api/teams';
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  createTeam(name: string, members: string[]) {
    const uri = 'api/team';
    const data = {
      is_team: true,
      is_public: false,
      members: this.toPersonId(members),
      set_abbreviation: name,
    };
    return this.axiosClient.post(uri, data, {
      headers: this.headers,
    });
  }

  getGroup(groupId) {
    const uri = `/api/group/${groupId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateGroup(groupId, data) {
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

  /* post */
  sendPost(groupId, text: string) {
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

  updatePost(postId, data) {
    const uri = `api/post/${postId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  deletePost(postId, groupId) {
    return this.updatePost(postId, { _id: postId, deactivated: true, group_id: groupId, });
  }


  /* profile */
  getProfile(rcId?: string) {
    const profileId = rcId ? this.toProfileId(rcId) : this.myProfile._id;
    const uri = `api/profile/${profileId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateProfile(rcId: string, data) {
    const profileId = rcId ? this.toProfileId(rcId) : this.myProfile._id;
    const uri = `api/profile/${profileId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  /* state */
  getState(rcId?: string) {
    const stateId = rcId ? this.toStateId(rcId) : this.myState._id;
    const uri = `api/state/${stateId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateState(rcId: string, data) {
    const stateId = rcId ? this.toStateId(rcId) : this.myState._id;
    const uri = `api/state/${stateId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  partialUpdateState(rcId: string, data) {
    const stateId = rcId ? this.toStateId(rcId) : this.myState._id;
    const uri = `api/save_state_partial/${stateId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  /* high level API */
  deactivated(rcId: string) {
    this.updatePerson(rcId, { deactivated: true });
  }

  async markAsRead(rcId: string, groupIds: string[]) {
    if (!groupIds.length) return;
    const readThrough = {};
    for (let i = 0; i < groupIds.length; i++) {
      const id = groupIds[i];
      const group = await this.getGroup(id);
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
    await this.partialUpdateState(rcId, params);
  }

  async getIdsOfGroupsWithUnreadMessages(rcId: string) {
    const res = await this.getState(rcId);
    const state = res.data;
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

  async skipCloseConversationConfirmation(rcId: string, skipCloseConversationConfirm: boolean) {
    const profileId = rcId ? this.toProfileId(rcId) : this.myProfile._id;
    const data: object = { skip_close_conversation_confirmation: skipCloseConversationConfirm };
    return await this.updateProfile(profileId, data);
  }
}
