import { GroupService, ProfileService } from 'sdk/src/service';
import SectionGroupHandler from '../../store/handler/SectionGroupHandler';

import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store/base/StoreManager';
import history from '@/history';
import { StateService } from 'sdk/service';

class GroupHandler {
  static _groupService: GroupService = GroupService.getInstance();
  static _sectionHandler: SectionGroupHandler;
  static _profileService: ProfileService = ProfileService.getInstance();
  static accessGroup(id: number) {
    const accessTime: number = +new Date();
    return this._groupService.updateGroupLastAccessedTime({
      id,
      timestamp: accessTime,
    });
  }

  static async groupIdValidator(id: number) {
    const group = await this._groupService.getById(id);
    if (!group) {
      return;
    }
    return this._groupService.isValid(group);
  }

  static async isGroupHidden(id: number) {
    return this._profileService.isConversationHidden(id);
  }
}

export class MessageRouterChangeHelper {
  static sourceHandlers = {
    leftRail: GroupHandler.accessGroup.bind(GroupHandler),
  };
  private static _stateService: StateService = StateService.getInstance();
  static async getLastGroupId() {
    const state = await this._stateService.getMyState();
    if (state && state.last_group_id) {
      const lastGroupId = state.last_group_id;
      const [isHidden, isValidate] = await Promise.all([
        await GroupHandler.isGroupHidden(lastGroupId),
        await GroupHandler.groupIdValidator(lastGroupId),
      ]);
      return !isHidden && isValidate ? String(lastGroupId) : '';
    }
    return '';
  }

  static async goToLastOpenedGroup() {
    const lastGroupId = await this.getLastGroupId();
    this.goToConversation(lastGroupId);
  }

  static async goToConversation(id?: string) {
    const lastGroupId = await this.getLastGroupId();
    history.push(`/messages/${id}`);
    this.updateCurrentConversationId(lastGroupId);
  }

  static updateCurrentConversationId(id: number | string = 0) {
    let groupId = id;
    if (typeof id === 'string' && !/\d+/.test(id)) {
      groupId = 0;
    }
    storeManager
      .getGlobalStore()
      .set(GLOBAL_KEYS.CURRENT_CONVERSATION_ID, Number(groupId));
    if (groupId) {
      const id = Number(groupId);
      const { state } = window.history.state || { state: {} };
      if (!state || !state.source) {
        SectionGroupHandler.getInstance(() => {
          GroupHandler.accessGroup(id);
        });
      }
    }
  }
}
