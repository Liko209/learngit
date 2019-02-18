/*
 * @Author: Andy Hu
 * @Date: 2018-12-07 14:48:11
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupService } from 'sdk/module/group';
import { ProfileService } from 'sdk/service/profile';
import { StateService } from 'sdk/module/state';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store/base/StoreManager';
import history from '@/history';
import { Action } from 'history';
import { mainLogger } from 'sdk';
class GroupHandler {
  static accessGroup(id: number) {
    const accessTime: number = +new Date();
    const _groupService: GroupService = GroupService.getInstance();
    _groupService
      .updateGroupLastAccessedTime({
        id,
        timestamp: accessTime,
      })
      .catch((err: any) => {
        mainLogger.tags('GroupHandler').info(`access Group ${id} fail:`, err);
      });
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
    try {
      await _profileService.reopenConversation(id);
    } catch (error) {
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
    this._goToConversation(lastGroupId, 'REPLACE');
  }
  static async goToConversation(id: string, action?: Action) {
    const validId = await this.verifyGroup(Number(id));
    return this._goToConversation(validId, action);
  }

  private static async _goToConversation(id: string, action?: Action) {
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
    const groupService: GroupService = GroupService.getInstance();
    const isGroupCanBeShown = await groupService.isGroupCanBeShown(id);
    return isGroupCanBeShown ? String(id) : '';
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
    handler.onReady((conversationList: number[]) => {
      GroupHandler.ensureGroupOpened(id);
      if (conversationList.includes(id)) {
        return;
      }
      GroupHandler.accessGroup(id);
    });
  }
}
