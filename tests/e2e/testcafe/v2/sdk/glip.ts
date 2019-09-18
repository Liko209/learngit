import * as assert from 'assert';
import * as querystring from 'querystring';
import * as _ from 'lodash';
import axios, { AxiosInstance } from 'axios';
import { RcPlatformSdk } from './platform';
import { H } from '../helpers';
import { MiscUtils } from '../utils';

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
    MiscUtils.addDebugLog(this.axiosClient, 'glip');
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

  async init(isReset: Boolean = true) {
    const res = await this.authByRcToken(true);
    this.accessToken = res.headers['x-authorization'];
    this.initData = res.data;
    this.glipDb.updateWithInitData(this.initData);
    if (isReset) {
      try {
        await this.resetProfileAndState();
      } catch (e) { }
    }
  }

  /* person */
  getPerson(rcId?: string) {
    const personId = rcId ? this.toPersonId(rcId) : this.myPersonId;
    const uri = `api/person/${personId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updatePerson(data: object, rcId?: string) {
    const personId = rcId ? this.toPersonId(rcId) : this.myPersonId;
    const uri = `api/person/${personId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  removeGuest(rcId?: string) {
    const personId = rcId ? this.toPersonId(rcId) : this.myPersonId;
    const uri = `api/remove_guest/${personId}`;
    return this.axiosClient.put(uri, undefined, {
      headers: this.headers,
    });
  }

  async getPersonPartialData(keyword: string, rcId?: string) {
    return await this.getPerson(rcId).then(res => res.data[keyword]);
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

  async getTeamIdByName(teamName: string) {
    const teams = await this.getTeams().then(res => res.data.teams);
    if (!teams) return [];
    const ids = teams.filter(team => team['set_abbreviation'] == teamName).map(team => team['_id']);
    return ids[0];
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

  async removeTeamMembers(groupId: string | number, rcIds: string | string[]) {
    const uri = `api/remove_team_members/${groupId}`;
    const members = [].concat(await this.toPersonId(rcIds))
    const data = {
      members
    };
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  async addTeamMembers(groupId: string | number, rcIds: string | string[]) {
    const uri = `api/add_team_members/${groupId}`;
    const members = [].concat(await this.toPersonId(rcIds))
    const data = {
      members
    };
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  getGroup(groupId: string | number) {
    const uri = `/api/group/${groupId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateGroup(groupId: string | number, data) {
    const uri = `/api/group/${groupId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  modifyGroupName(groupId: string | number, name) {
    const uri = `/api/group/${groupId}`;
    const data = { set_abbreviation: name };
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  async addGroupMembers(groupId: string | number, rcIds: string[] | string) {
    const oldMembers: number[] = await this.getGroup(groupId).then(res => res.data.members);
    let members = [];
    const personIds = await this.toPersonId(rcIds);
    if (Object.prototype.toString.call(personIds) === '[object Array]') {
      members = oldMembers.concat(personIds);
    } else {
      members = oldMembers;
      members.push(personIds);
    }
    await this.updateGroup(groupId, { members });
  }

  /* post */
  sendPost(groupId, text: string, options?: object) {
    const uri = 'api/post';
    const data = {
      group_id: groupId,
      is_new: true,
      is_sms: false,
      text,
      ...options
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

  updateProfile(data: object, rcId?: string) {
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
    const meChatId = await this.getMeChatId();

    const initData = {
      new_message_badges: "groups_and_mentions",
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
      want_push_missed_calls_and_voicemails: 1,
      send_push_notifications_ignoring_presence: 0,
      send_email_notifications_ignoring_presence: 0,
      has_new_notification_defaults: true,
      deactivated: false,
      favorite_group_ids: [+meChatId],
      me_tab: true,
      skip_close_conversation_confirmation: false,
      max_leftrail_group_tabs2: 20,
      favorite_post_ids: [],
      calling_option: 'glip'
    }
    const data = _.assign(initData, ...groups.map(key => ({ [key]: false })));
    return await this.updateProfile(data, rcId);
  }

  async bookmarkPosts(postIds: string | number | string[] | number[], rcId?: string) {
    const data = {
      favorite_post_ids: H.toNumberArray(postIds)
    }
    await this.updateProfile(data, rcId);
  }

  async setDefaultPhoneApp(val: 'ringcentral' | 'glip', rcId?: string) {
    await this.updateProfile({ calling_option: val }, rcId);
  }

  /* state */
  getState(rcId?: string) {
    const stateId = rcId ? this.toStateId(rcId) : this.myState._id;
    const uri = `api/state/${stateId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateState(data: object, rcId?: string) {
    const stateId = rcId ? this.toStateId(rcId) : this.myState._id;
    const uri = `api/state/${stateId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  partialUpdateState(data: object, rcId?: string) {
    const stateId = rcId ? this.toStateId(rcId) : this.myState._id;
    const uri = `api/save_state_partial/${stateId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  async resetState(rcId?: string) {
    const initData = {
      "model_size": 0,
      "is_new": true,
      "tour_complete": true,
      "deactivated": false,
      "applied_patches": { "clean_unused_keys": true },
      "do_kip_bot": true,
      "_csrf": null,
      "first_time_users_ensured": true,
      "desktop_banner_dismissed": true,
      "last_group_id": 0,
    }
    await this.clearAllUmi();
    return await this.partialUpdateState(initData, rcId);
  }

  async resetProfileAndState(rcId?: string) {
    await this.resetProfile(rcId);
    await this.resetState(rcId);
  }

  /* high level API */
  async deactivated(rcId: string) {
    await this.updatePerson({ deactivated: true }, rcId);
  }

  async markAsRead(groupIds: string[], rcId?: string, ) {
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
    await this.partialUpdateState(params, rcId);
  }

  async getIdsOfGroupsWithUnreadMessages(rcId?: string) {
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
    await this.markAsRead(unreadGroupIds, rcId);
  }

  async skipCloseConversationConfirmation(skipCloseConversationConfirm: boolean, rcId?: string) {
    const data: object = { skip_close_conversation_confirmation: skipCloseConversationConfirm };
    return await this.updateProfile(data, rcId);
  }

  async setLastGroupId(groupId: string | number, rcId?: string) {
    await this.partialUpdateState({ last_group_id: +groupId }, rcId);
  }

  async getMeChatId(rcId?: string) {
    return await this.getPersonPartialData('me_group_id', rcId);
  }

  async setLastGroupIdIsMeChatId() {
    const meChatId = await this.getMeChatId();
    await this.setLastGroupId(meChatId);
  }

  async showAllGroups(rcId?: string) {
    const groupList = await this.getTeamsIds();
    const data = _.assign(
      {},
      ...groupList.map(id => {
        return { [`hide_group_${id}`]: false }
      })
    )
    await this.updateProfile(data, rcId);
  }

  async showGroups(groupIds: string[] | number[] | string | number, rcId?: string) {
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
    await this.updateProfile(data, rcId);
  }

  async hideGroups(groupIds: string[] | number[] | string | number, rcId?: string) {
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
    await this.updateProfile(data, rcId);
  }

  async favoriteGroups(groupIds: string | number | string[] | number[], rcId?: string) {
    const data = {
      favorite_group_ids: H.toNumberArray(groupIds)
    }
    await this.updateProfile(data, rcId);
  }

  async clearFavoriteGroups(rcId?: string) {
    const data = {
      favorite_group_ids: [],
    }
    await this.updateProfile(data, rcId);
  }

  async setNewMessageBadges(value: 'groups_and_mentions' | 'all', rcId?) {
    await this.updateProfile({ new_message_badges: value }, rcId);
  }

  async clearFavoriteGroupsRemainMeChat(rcId?: string) {
    const meChatId = await this.getMeChatId();
    await this.favoriteGroups([+meChatId], rcId);
  }

  async setMaxTeamDisplay(n: number, rcId?: string) {
    await this.updateProfile({ max_leftrail_group_tabs2: n }, rcId);
  }

  async updateTeamName(teamId: string | number, newName: string) {
    await this.updateGroup(+teamId, { set_abbreviation: newName });
  }

  /* task */
  createTask(data: object) {
    const uri = `api/task`;
    return this.axiosClient.post(uri, data, {
      headers: this.headers,
    });
  }

  getTask(taskId: string | number) {
    const uri = `api/task/${taskId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateTask(taskId: string | number, data: object) {
    const uri = `api/task/${taskId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  async createSimpleTask(groupIds: string[] | string, rcIds: string[] | string, title: string, options?: object) {
    rcIds = rcIds ? this.toPersonId(rcIds) : this.myPersonId;
    const data = _.assign({
      text: title,
      assigned_to_ids: H.toNumberArray(rcIds),
      group_ids: H.toNumberArray(groupIds),
    },
      options
    )
    return await this.createTask(data);
  }

  async deleteTask(taskId: string) {
    await this.updateTask(taskId, {
      deactivated: true
    });
  }

  /* note */
  createNote(data: object) {
    const uri = `api/page`;
    return this.axiosClient.post(uri, data, {
      headers: this.headers,
    });
  }

  getNote(noteId: string | number) {
    const uri = `api/page/${noteId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  getNoteContent(noteId: string | number) {
    const uri = `api/pages_body/${noteId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateNote(noteId: string | number, data: object) {
    const uri = `api/page/${noteId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  async createSimpleNote(groupIds: string[] | string, title: string, options?: object) {
    const group_ids = H.toNumberArray(groupIds);
    const data = _.assign({
      title,
      group_ids
    },
      options
    )
    return await this.createNote(data);
  }

  async deleteNote(noteId: string | number) {
    await this.updateNote(noteId, {
      deactivated: true
    });
  }

  /* event */
  createEvent(data: object) {
    const uri = `api/event`;
    return this.axiosClient.post(uri, data, {
      headers: this.headers,
    });
  }

  getEvent(eventId: string | number) {
    const uri = `api/event/${eventId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateEvent(eventId: string | number, data: object) {
    const uri = `api/event/${eventId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  async createSimpleEvent(data: { groupIds: string[] | string, title: string, rcIds?, start?: number, end?: number, description?: string, location?: string, repeat?: string, color?: string }, options?: object) {
    const rcIds = data.rcIds ? this.toPersonId(data.rcIds) : this.myPersonId;
    const neededData = _.assign({
      text: data.title,
      group_ids: H.toNumberArray(data.groupIds),
      invitee_ids: H.toNumberArray(rcIds),
      start: data.start || new Date().getTime() + 1800000, // start time after 30 minutes from now
      end: data.end || new Date().getTime() + 3600000, // end time after 60 minutes from now
      repeat: data.repeat || 'none',
      location: data.location,
      description: data.description,
      color: data.color || 'black',
    },
      options
    )
    const newData = _.pickBy(neededData, _.identity);
    return await this.createEvent(newData);
  }

  async deleteEvent(eventId: string | number) {
    await this.updateEvent(eventId, {
      deactivated: true
    });
  }

  /* code snippet */
  createCodeSnippet(data: object) {
    const uri = `api/code`
    return this.axiosClient.post(uri, data, {
      headers: this.headers,
    })
  }

  updateCodeSnippet(id, data) {
    const uri = `api/code/${id}`
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  async createSimpleCodeSnippet(groupIds: string[] | string, body: string, title?: string, options?: object) {
    const data = _.assign({
      title: title || 'untitled',
      body: body,
      group_ids: H.toNumberArray(groupIds),
      mode: 'xml',
    },
      options
    )

    return await this.createCodeSnippet(data);
  }

  async deleteCodeSnippet(codeSnippetId: string | number) {
    await this.updateCodeSnippet(codeSnippetId, {
      deactivated: true
    });
  }

  /* audio conference */
  // need sign on status???
  createAudioConference(data: object) {
    const uri = `api/conference`;
    return this.axiosClient.post(uri, data, {
      headers: this.headers,
    });
  }

  async createSimpleAudioConference(groupIds: string[] | string, options?: object) {
    const data = _.assign({
      group_ids: H.toNumberArray(groupIds)
    },
      options
    )
    return await this.createAudioConference(data);
  }

  async getPostItemsByTypeId(postId: string | number, typeId: number | string) {
    const items = await this.getPost(postId).then(res => res.data.items);
    return items.filter(item => item.type_id == `${typeId}`).map(item => item.id);
  }

  /* file and image */
  async getFilesIdsFromPostId(postId: string | number) {
    return await this.getPostItemsByTypeId(postId, 10);
  }

  getFile(fileId: string | number) {
    const uri = `/api/file/${fileId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateFile(fileId: string | number, data: object) {
    const uri = `/api/file/${fileId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  async updateFileName(fileId: string, name: string) {
    return await this.updateFile(fileId, { name });
  }

  async deleteFile(fileId: string | number) {
    return await this.updateFile(fileId, {
      deactivated: true
    });
  }

  /* links */
  async getLinksIdsFromPostId(postId: string | number) {
    return this.getPostItemsByTypeId(postId, 17);
  }

  getLink(linkId: string | number) {
    const uri = `/api/link/${linkId}`;
    return this.axiosClient.get(uri, {
      headers: this.headers,
    });
  }

  updateLink(linkId: string | number, data: object) {
    const uri = `/api/link/${linkId}`;
    return this.axiosClient.put(uri, data, {
      headers: this.headers,
    });
  }

  async updateLinkUrlTitle(linkId: string, data: { url?: string, title?: string }) {
    return await this.updateLink(linkId, data);
  }

  async deleteLink(linkId: string | number) {
    return await this.updateLink(linkId, {
      deactivated: true
    });
  }

}
