/*
 * @Author: Andy Hu
 * @Date: 2018-12-07 14:48:11
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { Notification } from '@/containers/Notification';
import { GroupService } from 'sdk/module/group';
import { ProfileService } from 'sdk/module/profile';
import { StateService } from 'sdk/module/state';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store/base/StoreManager';
import history from '@/history';
import { Action } from 'history';
import { mainLogger } from 'foundation/log';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { GROUP_CAN_NOT_SHOWN_REASON } from 'sdk/module/group/constants';
import { getGlobalValue } from '@/store/utils/entities';
import { getErrorType } from '@/common/catchError';
import _ from 'lodash';

const logger = mainLogger.tags('messageRouter Helper');

class GroupHandler {
  static accessGroup(id: number) {
    const accessTime: number = +new Date();
    const _groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
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
    const _profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    return _profileService.isConversationHidden(id);
  }

  static async ensureGroupOpened(id: number) {
    const isHidden = await this.isGroupHidden(id);
    if (!isHidden) {
      return;
    }
    const _profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    try {
      await _profileService.reopenConversation(id);
    } catch (err) {
      history.replace('/messages/loading', {
        errorType: getErrorType(err),
        params: { id },
        error: true,
      });
    }
  }
}

export class MessageRouterChangeHelper {
  static defaultPageId = '';
  static isIndexDone = false;
  static async getLastGroupId() {
    const stateService = ServiceLoader.getInstance<StateService>(
      ServiceConfig.STATE_SERVICE,
    );
    const state = await stateService.getMyState();

    if (state && state.last_group_id) {
      const isHidden = await GroupHandler.isGroupHidden(state.last_group_id);
      if (isHidden) {
        logger.log(`getLastGroupId, group ${state.last_group_id} is Hidden`);
        return '';
      }
      return this.verifyGroup(state.last_group_id, false);
    }
    logger.log('getLastGroupId, lastGroup in state is undefined');
    return '';
  }

  static async goToLastOpenedGroup() {
    const lastGroupId = await this.getLastGroupId();
    logger.log(`LastGroupId is ${lastGroupId}, doing redirection`);
    this._doRouterRedirection(lastGroupId, 'REPLACE');
    this.updateCurrentConversationId(lastGroupId);
  }

  static async goToConversation(id?: string, action?: Action, state?: any) {
    if (!id) {
      return this._goToDefaultConversation();
    }
    if (!this.isConversation(id)) {
      return this.updateCurrentConversationId(this.defaultPageId);
    }
    this._goToConversationById(id, action, state);
  }

  private static async _goToDefaultConversation() {
    const id = this.defaultPageId;
    await this._doRouterRedirection(id);
    this.updateCurrentConversationId(id);
  }

  private static async _goToConversationById(
    id: string,
    action?: Action,
    state?: any,
  ) {
    const validId = await this.verifyGroup(Number(id));
    this.ensureGroupIsOpened(Number(id));
    this._doRouterRedirection(validId, action, state);
    this.updateCurrentConversationId(id);
  }

  private static async _doRouterRedirection(
    id: string,
    action?: Action,
    state?: any,
  ) {
    switch (action) {
      case 'REPLACE':
        if (
          Number(id) === getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID) &&
          _.isEqual(state, history.location.state)
        ) {
          // to trigger history.listen even if it's same conversation. useful to detect when user tries to go to conversation on popups.
          // history.listen will not trigger if the location and state is the same so we need to manually create a random state change.
          history.replace(`/messages/${id}`, { _temp_: Date.now() });
        }
        history.replace(`/messages/${id}`, state);
        break;
      default:
        history.push(`/messages/${id}`, state);
        break;
    }
  }

  static async verifyGroup(id: number, showToaster = true) {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const { canBeShown, reason } = await groupService.isGroupCanBeShown(id);
    logger.log(`Verifying group ${id}`);
    if (canBeShown) {
      return String(id);
    }
    logger.log(`Group ${id} cannot be shown for ${reason}`);

    if (!reason || !showToaster) {
      return '';
    }

    const messageMap = {
      [GROUP_CAN_NOT_SHOWN_REASON.NOT_AUTHORIZED]:
        'people.prompt.conversationPrivate',
      [GROUP_CAN_NOT_SHOWN_REASON.ARCHIVED]:
        'people.prompt.conversationArchived',
      [GROUP_CAN_NOT_SHOWN_REASON.DEACTIVATED]:
        'people.prompt.conversationDeleted',
    };

    messageMap[reason] && Notification.flashToast({
      message: messageMap[reason],
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });

    return '';
  }

  static isConversation(id: string) {
    return /\d+/.test(id);
  }

  static updateCurrentConversationId(id: string) {
    storeManager
      .getGlobalStore()
      .set(GLOBAL_KEYS.CURRENT_CONVERSATION_ID, Number(id));
  }

  static ensureGroupIsOpened(id: number) {
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
