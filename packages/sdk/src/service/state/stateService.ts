/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 13:32:43
 * Copyright © RingCentral. All rights reserved.
 */

import {
  daoManager,
  StateDao,
  GroupStateDao,
  AccountDao,
  ACCOUNT_USER_ID,
} from '../../dao';
import { GroupState, MyState, Post } from '../../models';
import StateAPI from '../../api/glip/state';
import BaseService from '../BaseService';
import PostService from '../post';
import { SOCKET, SERVICE } from '../eventKey';
import { ENTITY } from '../../service/eventKey';
import handleData, { handlePartialData, handleGroupChange } from './handleData';
import _ from 'lodash';
import { UMI_METRICS } from '../constants';
import notificationCenter from '../notificationCenter';
// import AccountService from '../account/index';
// import PersonService from '../person/index';

class StateService extends BaseService<GroupState> {
  static serviceName = 'StateService';

  constructor() {
    const subscriptions = {
      [SOCKET.STATE]: handleData,
      [SOCKET.PARTIAL_STATE]: handlePartialData,
      [SERVICE.GROUP_CURSOR]: handleGroupChange,
    };
    super(GroupStateDao, StateAPI, handleData, subscriptions);
  }

  static buildMarkAsReadParam(groupId: number, lastPostId: number) {
    return {
      [`unread_count:${groupId}`]: 0,
      [`unread_mentions_count:${groupId}`]: 0,
      [`unread_deactivated_count:${groupId}`]: 0,
      [`read_through:${groupId}`]: lastPostId,
      [`marked_as_unread:${groupId}`]: false,
    };
  }

  static buildUpdateStateParam(groupId: number) {
    return {
      last_group_id: groupId,
    };
  }

  // getGroupStateById(groupId) {
  //   const groupStateDao = daoManager.getDao(GroupStateDao);
  //   return groupStateDao.get(groupId);
  // }
  async getById(id: number): Promise<GroupState> {
    const result = await this.getByIdFromDao(id); // groupId
    // if (!result) {
    //   const myState = await this.getMyState();
    //   if (myState) {
    //     result = await this.getByIdFromAPI(myState.id); // state id
    //   }
    // }
    return result;
  }

  async markAsRead(groupId: number): Promise<void> {
    const lastPost = (await this.getLastPostOfGroup(groupId)) || undefined;
    let lastPostId = lastPost && lastPost.id;
    if (!lastPostId) {
      const postService = PostService.getInstance<PostService>();
      lastPostId =
        (await postService.getNewestPostIdOfGroup(groupId)) || undefined;
    }

    const partialState = {
      id: groupId,
      read_through: lastPostId,
      last_read_through: lastPostId,
      unread_count: 0,
      unread_mentions_count: 0,
    };

    await this.updateState(
      partialState,
      lastPostId,
      StateService.buildMarkAsReadParam,
    );
  }

  async updateLastGroup(groupId: number): Promise<void> {
    const currentState = await this.getMyState();
    if (currentState) {
      await StateAPI.saveStatePartial(
        currentState.id,
        StateService.buildUpdateStateParam(groupId),
      );
    }
  }

  async getGroupStatesFromLocalWithUnread(
    ids: number[],
  ): Promise<GroupState[]> {
    const states = await this.getAllGroupStatesFromLocal(ids);
    const result = states.filter((item: GroupState) => {
      return item.unread_count || item.unread_mentions_count;
    });
    return result;
  }

  getAllGroupStatesFromLocal(ids: number[]): Promise<GroupState[]> {
    const groupStateDao = daoManager.getDao(GroupStateDao);
    return groupStateDao.getByIds(ids);
  }

  async updateState(
    partialState: Partial<GroupState>,
    lastPostId: number | undefined,
    paramBuilder: Function,
  ): Promise<void> {
    const currentState = await this.getMyState();
    const groupStateDao = daoManager.getDao(GroupStateDao);
    const groupId = partialState.id ? partialState.id : 0;
    const state = await groupStateDao.get(groupId);
    if (state) {
      const updatedState = this.getMergedModel(partialState, state);
      notificationCenter.emitEntityUpdate(
        ENTITY.GROUP_STATE,
        [updatedState],
        [partialState],
      );

      if (
        lastPostId &&
        currentState &&
        state.unread_count &&
        state.unread_count > 0
      ) {
        await StateAPI.saveStatePartial(
          currentState.id,
          paramBuilder(state.id, lastPostId),
        );
      }
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

  async umiMetricChanged(groupState: GroupState) {
    const dao: AccountDao = daoManager.getKVDao(AccountDao);
    const currentPersonId = dao.get(ACCOUNT_USER_ID);
    const isSelf =
      groupState.__trigger_ids &&
      currentPersonId &&
      groupState.__trigger_ids.includes(currentPersonId);
    const hasUmiMetric = _.some(UMI_METRICS, (umiMetric: string) => {
      return _.has(groupState, umiMetric);
    });
    return !isSelf && hasUmiMetric;
  }

  async calculateUMI(groupStates: GroupState[]) {
    if (!groupStates.length) {
      // mainLogger.info('[State Service]: empty new umis to calculate');
      return [];
    }
    const ids = _.map(groupStates, 'id');
    const originGroupStates = await this.getAllGroupStatesFromLocal(ids);
    const resultGroupStates = await Promise.all(
      groupStates.map(async (updatedGroupState: GroupState) => {
        if (!(await this.umiMetricChanged(updatedGroupState))) {
          return updatedGroupState;
        }
        const originGroupState = _.pick(
          _.find(originGroupStates, { id: updatedGroupState.id }),
          UMI_METRICS,
        );

        if (originGroupState) {
          // 1. UMI related check
          if (
            updatedGroupState.group_post_cursor &&
            updatedGroupState.group_post_drp_cursor
          ) {
            if (
              updatedGroupState.group_post_cursor +
                updatedGroupState.group_post_drp_cursor <
              (originGroupState.group_post_cursor || 0) +
                (originGroupState.group_post_drp_cursor || 0)
            ) {
              // mainLogger.info(
              //   '[State service]: invalid group_post_cursor and group_post_drp_cursor change',
              // );
              return;
            }
          } else if (updatedGroupState.group_post_cursor) {
            if (
              updatedGroupState.group_post_cursor <
              (originGroupState.group_post_cursor || 0)
            ) {
              // mainLogger.info(
              //   '[State service]: invalid group_post_cursor change',
              // );
              return;
            }
          }

          if (updatedGroupState.post_cursor) {
            const cursorIncrease =
              updatedGroupState.post_cursor >
              (originGroupState.post_cursor || 0);
            const markAsUnread = updatedGroupState.marked_as_unread;
            if (!cursorIncrease && !markAsUnread) {
              // mainLogger.info(
              //   `[State service]: invalid state_post_cursor change: ${updatedGroupState}`,
              // );
              return;
            }
          }
          if (
            updatedGroupState.unread_deactivated_count &&
            originGroupState.unread_deactivated_count &&
            updatedGroupState.unread_deactivated_count <
              originGroupState.unread_deactivated_count
          ) {
            // mainLogger.info(
            //   '[State service]: invalid unread_deactivated_count change',
            // );
            return;
          }
          // End of UMI related check
        }

        const resultGroupState = _.merge(
          {},
          originGroupState,
          updatedGroupState,
        );
        // mainLogger.info(
        //   `[State service]: resultGroupState ${JSON.stringify(
        //     resultGroupState,
        //   )}`,
        // );
        // mainLogger.info(
        //   `[State service]: originGroupState ${JSON.stringify(
        //     originGroupState,
        //   )}`,
        // );

        // Calculate unread and update group state directly
        const group_cursor =
          (resultGroupState.group_post_cursor || 0) +
          (resultGroupState.group_post_drp_cursor || 0);
        const state_cursor =
          (resultGroupState.post_cursor || 0) +
          (resultGroupState.unread_deactivated_count || 0);
        resultGroupState.unread_count = Math.max(
          group_cursor - state_cursor,
          0,
        );
        delete resultGroupState.__trigger_ids;
        return resultGroupState;
      }),
    );

    return _.compact(resultGroupStates);
  }
}

export { StateService };
