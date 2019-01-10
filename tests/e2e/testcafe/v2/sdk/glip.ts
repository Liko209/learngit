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
    if (undefined === this.platform.token) {
      await this.platform.init();
    }
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

  async init() {
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

  async getTeamsIds() {
    const teams = await this.getTeams().then(res => res.data.teams);
    if (!teams) return [];
    const ids = teams.filter(team => team['_id']).map(team => team['_id']);
    return ids;
  }

  async getCompanyTeamId() {
    const teams = await this.getTeams().then(res => res.data.teams);
    if (!teams) return [];
    const ids = teams.filter(team => team["is_company_team"] == true).map(team => team['_id']);
    return ids;
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

  getGroup(groupId: string | number) {
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

  getPost(postId: string | number) {
    const uri = `api/post/${postId}`;
    return this.axiosClient.get(uri, {
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

  async getPostLikesCount(PostId: string | number): Promise<number> {
    return await this.getPost(PostId).then(res => {
      return res.data.likes ? res.data.likes : [];
    }).then(likes => {
      return likes.length;
    });
  }

  async likePost(postId, rcId?: string) {
    const initData = await this.getPost(postId).then(res => { return res.data });
    const likes = initData.likes ? initData.likes : [];
    const text = initData.text;
    const personId = rcId ? this.toPersonId(rcId) : this.myPersonId;
    let data = {};
    if (likes.indexOf(personId) === -1) {
      likes.push(personId);
      data = {
        _id: postId,
        likes,
        text,
      }
      return await this.updatePost(postId, data);
    }
    return;
  }

  async unlikePost(postId, rcId?: string) {
    const initData = await this.getPost(postId).then(res => { return res.data });
    const likes = initData.likes ? initData.likes : [];
    const text = initData.text;
    const personId = rcId ? this.toPersonId(rcId) : this.myPersonId;
    const index = likes.indexOf(personId);
    if (-1 < index) {
      likes.splice(index, 1);
      const data = {
        _id: postId,
        likes,
        text,
      }
      return await this.updatePost(postId, data);
    }
    return;
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

  async resetProfile(rcId?: string) {
    const currentProfile = await this.getProfile().then(res => res.data);
    const groups = Object.keys(currentProfile)
      .filter((key: string) => {
        return (/hide_group_/.test(key)) && (currentProfile[key] == true);
      });
    const meChatId = await this.getPerson(rcId).then(res => res.data.me_group_id);

    const initData = {
      model_size: 0,
      is_new: false,
      want_email_people: 900000,
      want_email_team: 0,
      want_push_team: 0,
      want_push_people: 1,
      want_email_mentions: true,
      want_push_mentions: true,
      want_push_video_chat: true,
      want_email_glip_today: true,
      new_message_badges: 'all',
      want_push_missed_calls_and_voicemails: 1,
      send_push_notifications_ignoring_presence: 0,
      send_email_notifications_ignoring_presence: 0,
      has_new_notification_defaults: true,
      deactivated: false,
      favorite_group_ids: [+meChatId],
      me_tab: true,
      skip_close_conversation_confirmation: false,
      max_leftrail_group_tabs2: 20,
      favorite_post_ids: []
    }
    const data = _.assign(initData, ...groups.map(key => ({ [key]: false })));
    return await this.updateProfile(rcId, data);
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
      ...groupIds.filter(id => {
        return readThrough[id];
      }).map(id => ({
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
    const companyTeamId = await this.getCompanyTeamId();
    unreadGroups.push(...companyTeamId);
    return unreadGroups;
  }

  async clearAllUmi(rcId?: string) {
    const unreadGroupIds = await this.getIdsOfGroupsWithUnreadMessages(rcId);
    await this.markAsRead(rcId, unreadGroupIds);
  }

  async skipCloseConversationConfirmation(rcId: string, skipCloseConversationConfirm: boolean) {
    const data: object = { skip_close_conversation_confirmation: skipCloseConversationConfirm };
    return await this.updateProfile(rcId, data);
  }

  async setLastGroupId(rcId: string, groupId: string | number) {
    await this.partialUpdateState(rcId, {
      last_group_id: +groupId,
    });
  }

  async showAllGroups(rcId?: string) {
    const groupList = await this.getTeamsIds();
    const data = _.assign(
      {},
      ...groupList.map(id => {
        return { [`hide_group_${id}`]: false }
      })
    )
    await this.updateProfile(rcId, data);
  }

  async showGroups(rcId: string, groupIds: string[] | number[] | string | number) {
    let data;
    if (Object.prototype.toString.call(groupIds) === '[object Array]') {
      data = _.assign(
        {},
        ...(groupIds as string[]).map(id => {
          return { [`hide_group_${id}`]: false }
        })
      )
    } else {
      data = { [`hide_group_${groupIds}`]: false }
    }
    await this.updateProfile(rcId, data);
  }

  async hideGroups(rcId: string, groupIds: string[] | number[]) {
    let data;
    if (Object.prototype.toString.call(groupIds) === '[object Array]') {
      data = _.assign(
        {},
        ...(groupIds as string[]).map(id => {
          return { [`hide_group_${id}`]: true }
        })
      )
    } else {
      data = { [`hide_group_${groupIds}`]: true }
    }
    await this.updateProfile(rcId, data);
  }

  async favoriteGroups(rcId: string, groupIds: number[]) {
    const data = {
      favorite_group_ids: groupIds
    }
    await this.updateProfile(rcId, data);
  }

  async clearFavoriteGroups(rcId?: string) {
    const data = {
      favorite_group_ids: [],
    }
    await this.updateProfile(rcId, data);
  }

  async clearFavoriteGroupsRemainMeChat(rcId?: string) {
    const meChatId = await this.getPerson(rcId).then(res => res.data.me_group_id);
    await this.favoriteGroups(rcId, [+meChatId]);
  }

  async setMaxTeamDisplay(rcId: string, n: number) {
    await this.updateProfile(rcId, { max_leftrail_group_tabs2: n });
  }

  async updateTeamName(teamId: string | number, newName: string) {
    await this.updateGroup(+teamId, { set_abbreviation: newName });
  }
}
