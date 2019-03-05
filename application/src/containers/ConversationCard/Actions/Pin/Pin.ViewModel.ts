/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-02-27 10:46:49
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { PinProps, PinViewProps } from './types';
import GroupService, { Group } from 'sdk/module/group';
import { Post } from 'sdk/module/post/entity';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import PostModel from '@/store/models/Post';
import config from '../../Activity';
import { TypeDictionary } from 'sdk/utils';

const CHECK_TYPE = [TypeDictionary.TYPE_ID_EVENT, TypeDictionary.TYPE_ID_TASK];

const PIN_OPTION_EXCLUDE_VERBS = [
  'assigned',
  'reassigned',
  'completed',
  'updated',
  'marked',
];

class PinViewModel extends StoreViewModel<PinProps> implements PinViewProps {
  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.groupId);
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.postId);
  }

  @computed
  private get _activityData() {
    let activityData: any;
    const { itemTypeIds } = this._post;
    if (itemTypeIds) {
      Object.keys(itemTypeIds).some((type: string) => {
        if (CHECK_TYPE.includes(+type)) {
          const props = {
            ...this._post,
            ids: itemTypeIds[type],
          };
          activityData = config[type](props);
          return true;
        }
        return false;
      });
    }
    return activityData;
  }

  @computed
  get shouldShowPinOption() {
    if (this._activityData) {
      const { verb } = this._activityData.parameter;
      const popVerb = verb.split('.').pop();
      return !PIN_OPTION_EXCLUDE_VERBS.includes(popVerb);
    }
    return true;
  }

  @computed
  get shouldDisablePinOption() {
    return !this._group.canPin;
  }

  @computed
  get isPin() {
    const { pinnedPostIds } = this._group;
    return !!pinnedPostIds && pinnedPostIds.includes(this.props.postId);
  }

  @action
  pin = async (toPin: boolean): Promise<void> => {
    const { postId, groupId } = this.props;
    const groupService: GroupService = GroupService.getInstance();
    await groupService.pinPost(postId, groupId, toPin);
  }
}

export { PinViewModel };
