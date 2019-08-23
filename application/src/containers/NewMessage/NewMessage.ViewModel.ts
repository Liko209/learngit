/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:55:53
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { StoreViewModel } from '@/store/ViewModel';
import { getGlobalValue, getEntity, getSingleEntity } from '@/store/utils';
import { PostService } from 'sdk/module/post';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import {
  goToConversationWithLoading,
  goToConversation,
  getConversationId,
} from '@/common/goToConversation';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import GroupService, { Group } from 'sdk/module/group';
import GroupModel from '@/store/models/Group';
import { analyticsCollector } from '@/AnalyticsCollector';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { UserPermission } from 'sdk/module/permission/entity';
import UserPermissionModel from '@/store/models/UserPermission';

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
  @observable
  isDirectMessage: boolean = false;
  @computed
  get canMentionTeam() {
    return getSingleEntity<UserPermission, UserPermissionModel>(
      ENTITY_NAME.USER_PERMISSION,
      'canMentionTeam',
    );
  }
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
  };
  @action
  handleCheckboxChange = (event: React.ChangeEvent<{}>, checked: boolean) => {
    this.isDirectMessage = checked;
  };

  @action
  newMessage = async (message: string) => {
    let ids = this.members.filter(id => _.isNumber(id)) as number[];
    const postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    if (this.isDirectMessage) {
      const personPromises: Promise<number | null>[] = [];
      const groupIds: number[] = [];
      ids.forEach(id => {
        if (GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_PERSON)) {
          personPromises.push(getConversationId(id));
        } else {
          groupIds.push(id);
        }
      });
      const conversationIds = (await Promise.all(personPromises)) as number[];
      ids = [...conversationIds, ...groupIds];

      const promise = ids.map((id: number) =>
        postService.sendPost({ groupId: id, text: message }),
      );
      await Promise.all(promise);
      ids[0] && goToConversation({ conversationId: ids[0] });
    } else {
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      const personIds = await groupService.getPersonIdsBySelectedItem(ids);
      goToConversationWithLoading({
        id: Array.from(personIds) as number[],
        async beforeJump(conversationId: number) {
          if (message && conversationId) {
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
              '',
              'send new message',
              'text',
              group.analysisType,
            );
          }
        },
      });
    }
  };
}

export { NewMessageViewModel };
