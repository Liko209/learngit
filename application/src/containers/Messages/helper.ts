/*
 * @Author: Andy Hu
 * @Date: 2018-12-07 14:48:11
 * Copyright © RingCentral. All rights reserved.
 */
import SectionGroupHandler from '../../store/handler/SectionGroupHandler';
import { GroupService } from 'sdk/service/group';
import { ProfileService } from 'sdk/service/profile';
import { StateService } from 'sdk/service/state';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store/base/StoreManager';
import history from '@/history';
import { Action } from 'history';
import { service } from 'sdk';

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
    const { state } = window.history.state || { state: {} };
    if (!state || !state.source || state.source !== 'leftRail') {
      const handler = SectionGroupHandler.getInstance();
      const triggerReady = () => {
        handler.onReady(() => {
          GroupHandler.ensureGroupOpened(id);
          GroupHandler.accessGroup(id);
        });
      };
      if (this.isIndexDone) {
        triggerReady();
      } else {
        const { notificationCenter, SERVICE } = service;
        notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
          this.isIndexDone = true;
          triggerReady();
        });
      }
    }
  }
}
