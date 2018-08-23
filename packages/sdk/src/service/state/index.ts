/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-07 09:05:56
 */
import { daoManager, StateDao, GroupStateDao } from '../../dao';
import { GroupState, MyState, Post } from '../../models';
import StateAPI from '../../api/glip/state';
import BaseService from '../BaseService';
import PostService from '../post';
import { SOCKET } from '../eventKey';
import handleData, { handlePartialData } from './handleData';

export default class StateService extends BaseService<GroupState> {
  static serviceName = 'StateService';

  constructor() {
    const subscriptions = {
      [SOCKET.STATE]: handleData,
      [SOCKET.PARTIAL_STATE]: handlePartialData,
    };
    super(GroupStateDao, StateAPI, handleData, subscriptions);
  }

  static buildMarkAsReadParam(groupId: number, lastPostId: number) {
    return {
      [`unread_count:${groupId}`]: 0,
      [`unread_mentions_count:${groupId}`]: 0,
      [`read_through:${groupId}`]: lastPostId,
      [`marked_as_unread:${groupId}`]: false,
    };
  }

  static buildUpdateStateParam(groupId: number, lastPostId: number) {
    return {
      last_group_id: groupId,
      [`last_read_through:${groupId}`]: lastPostId,
    };
  }

  // getGroupStateById(groupId) {
  //   const groupStateDao = daoManager.getDao(GroupStateDao);
  //   return groupStateDao.get(groupId);
  // }
  async getById(id: number): Promise<GroupState> {
    let result = await this.getByIdFromDao(id); // groupid
    if (!result) {
      const myState = await this.getMyState();
      if (myState) {
        result = await this.getByIdFromAPI(myState.id); // state id
      }
    }
    return result;
  }

  async markAsRead(groupId: number): Promise<void> {
    return this.updateState(groupId, StateService.buildMarkAsReadParam);
  }

  async updateLastGroup(groupId: number): Promise<void> {
    return this.updateState(groupId, StateService.buildUpdateStateParam);
  }

  getAllGroupStatesFromLocal(): Promise<GroupState[]> {
    const groupStateDao = daoManager.getDao(GroupStateDao);
    return groupStateDao.getAll() as Promise<GroupState[]>;
  }

  async updateState(groupId: number, paramBuilder: Function): Promise<void> {
    const lastPost = await this.getLastPostOfGroup(groupId);
    const currentState = await this.getMyState();
    const groupStateDao = daoManager.getDao(GroupStateDao);
    const state = await groupStateDao.get(groupId);

    if (currentState && lastPost && !!state && state.unread_count && state.unread_count > 0) {
      await StateAPI.saveStatePartial(currentState.id, paramBuilder(groupId, lastPost.id));
    }
  }

  async getLastPostOfGroup(groupId: number): Promise<Post | null> {
    const postService: PostService = PostService.getInstance();
    const lastPost: Post | null = await postService.getLastPostOfGroup(groupId);
    if (!lastPost) {
      return null;
    }
    return lastPost;
  }

  async getMyState(): Promise<MyState | null> {
    const stateDao = daoManager.getDao(StateDao);
    const result: MyState | null = await stateDao.getFirst();
    return result;
  }
}
