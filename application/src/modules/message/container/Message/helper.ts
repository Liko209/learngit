/*
 * @Author: Andy Hu
 * @Date: 2018-12-07 14:48:11
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupService } from 'sdk/service/group';
import { ProfileService } from 'sdk/service/profile';
import { StateService } from 'sdk/module/state';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store/base/StoreManager';
import history from '@/history';
import { Action } from 'history';
class GroupHandler {
  static accessGroup(id: number) {
    const accessTime: number = +new Date();
    const _groupService: GroupService = GroupService.getInstance();
    return _groupService.updateGroupLastAccessedTime({
      id,
      timestamp: accessTime,
    });
  }

  static async groupIdValidator(id: number) {
    const _groupService: GroupService = GroupService.getInstance();
    const group = await _groupService.getById(id);
    if (!group) {
      return;
    }
    return _groupService.isValid(group);
  }

  static async isGroupHidden(id: number) {
    const _profileService: ProfileService = ProfileService.getInstance();
    return _profileService.isConversationHidden(id);
  }

  static async ensureGroupOpened(id: number) {
    const isHidden = await this.isGroupHidden(id);
    if (!isHidden) {
      return;
    }
    const _profileService: ProfileService = ProfileService.getInstance();
    const result = await _profileService.reopenConversation(id);
    if (result.isErr()) {
      history.replace('/messages/loading', {
        id,
        error: true,
      });
    }
  }
}

export class MessageRouterChangeHelper {
  static defaultPageId = 0;
  static isIndexDone = false;
  static async getLastGroupId() {
    const stateService: StateService = StateService.getInstance();
    const state = await stateService.getMyState();
    if (state && state.last_group_id) {
      return this.verifyGroup(state.last_group_id);
    }
    return '';
  }

  static async goToLastOpenedGroup() {
    const lastGroupId = await this.getLastGroupId();
    this.goToConversation(lastGroupId, 'REPLACE');
  }

  static async goToConversation(id: string, action?: Action) {
    switch (action) {
      case 'REPLACE':
        history.replace(`/messages/${id}`);
        break;
      default:
        history.push(`/messages/${id}`, {
          source: 'reload',
        });
        break;
    }
    this.updateCurrentConversationId(id);
  }

  static async verifyGroup(id: number) {
    const [isHidden, isValidate] = await Promise.all([
      await GroupHandler.isGroupHidden(id),
      await GroupHandler.groupIdValidator(id),
    ]);
    return !isHidden && isValidate ? String(id) : '';
  }

  static isConversation(id: string) {
    return /\d+/.test(id);
  }

  static updateCurrentConversationId(id: string) {
    const groupId = this.isConversation(id) ? id : this.defaultPageId;
    if (this.isConversation(id)) {
      this.handleSourceOfRouter(Number(groupId));
    }
    storeManager
      .getGlobalStore()
      .set(GLOBAL_KEYS.CURRENT_CONVERSATION_ID, Number(groupId));
  }

  static handleSourceOfRouter(id: number) {
    const handler = SectionGroupHandler.getInstance();
    handler.onReady((conversationList: Set<number>) => {
      GroupHandler.ensureGroupOpened(id);
      if (conversationList.has(id)) {
        return;
      }
      GroupHandler.accessGroup(id);
    });
  }
}
