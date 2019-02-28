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

class PinViewModel extends StoreViewModel<PinProps> implements PinViewProps {
  @computed
  private get _groupId() {
    return this.props.groupId;
  }

  @computed
  private get _postId() {
    return this.props.postId;
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._groupId);
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._postId);
  }

  @computed
  private get _activityData() {
    const activity = {};
    const { itemTypeIds } = this._post;
    if (itemTypeIds) {
      Object.keys(itemTypeIds).forEach((type: string) => {
        if (config[type]) {
          const props = {
            ...this._post,
            ids: itemTypeIds[type],
          };
          activity[type] = config[type](props);
        }
      });
    }
    return activity;
  }

  @computed
  get shouldShowPinOption() {
    const pinOptionExcludeVerbs = [
      'assigned',
      'reassigned',
      'completed',
      'updated',
    ];
    const types = Object.keys(this._activityData);
    if (types && !!types.length) {
      const { verb } = this._activityData[types[0]].parameter;
      const popVerb = verb.split('.').pop();
      return !pinOptionExcludeVerbs.includes(popVerb);
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
    return !!pinnedPostIds && pinnedPostIds.includes(this._postId);
  }

  @action
  pin = async (toPin: boolean): Promise<void> => {
    const groupService: GroupService = GroupService.getInstance();
    await groupService.pinPost(this._postId, this._groupId, toPin);
  }
}

export { PinViewModel };
