/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:55:53
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';

import { StoreViewModel } from '@/store/ViewModel';
import { getGlobalValue, getEntity } from '@/store/utils';
import { PostService } from 'sdk/module/post';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { goToConversationWithLoading } from '@/common/goToConversation';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Group } from 'sdk/module/group';
import GroupModel from '@/store/models/Group';
import { analyticsCollector } from '@/AnalyticsCollector';

class NewMessageViewModel extends StoreViewModel {
  @observable
  emailError: boolean = false;
  @observable
  emailErrorMsg: string = '';
  @observable
  serverError: boolean = false;
  @observable
  members: (number | string)[] = [];
  @observable
  errorEmail: string;
  @observable
  errorUnknown: boolean = false;

  @computed
  get disabledOkBtn() {
    return this.members.length === 0;
  }

  @computed
  get isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  handleSearchContactChange = (items: any) => {
    this.members = items.map((item: any) => {
      if (item.id) {
        return item.id;
      }
      return item.email;
    });
    this.emailErrorMsg = '';
    this.emailError = false;
  }

  @action
  newMessage = async (message: string) => {
    goToConversationWithLoading({
      id: Array.from(this.members) as number[],
      async beforeJump(conversationId: number) {
        if (message && conversationId) {
          const postService = ServiceLoader.getInstance<PostService>(
            ServiceConfig.POST_SERVICE,
          );
          await postService.sendPost({
            groupId: conversationId,
            text: message,
          });

          // track analysis
          const group = getEntity<Group, GroupModel>(
            ENTITY_NAME.GROUP,
            conversationId,
          );
          analyticsCollector.sendPost(
            'send new message',
            'text',
            group.analysisType,
          );
        }
      },
    });
  }
}

export { NewMessageViewModel };
