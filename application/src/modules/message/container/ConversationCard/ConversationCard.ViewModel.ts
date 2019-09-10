/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-08 16:29:08
 * Copyright © RingCentral. All rights reserved.
 */
// import { promisedComputed } from 'computed-async-mobx';
import PostModel from '@/store/models/Post';
import { ConversationCardProps } from '@/modules/message/container/ConversationCard/types';
import moment from 'moment';
import { computed } from 'mobx';
import { getEntity, getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { Post } from 'sdk/module/post/entity';
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group';
import { Progress, PROGRESS_STATUS } from 'sdk/module/progress/entity';
import { ENTITY_NAME } from '@/store';
import { postTimestamp, dateFormatter } from '@/utils/date';
import PersonModel from '@/store/models/Person';
import ItemModel from '@/store/models/Item';
import GroupModel from '@/store/models/Group';
import { StoreViewModel } from '@/store/ViewModel';
import ProgressModel from '@/store/models/Progress';
import GlipTypeUtil from 'sdk/utils/glip-type-dictionary/util';
import {  Item } from 'sdk/module/item/entity';
import { getColonsEmoji, getStatusPlainText } from '@/common/getSharedStatus';
import { repliedEntityHandlers } from './utils';
import { getIntegration } from '../ConversationSheet/IntegrationItem/getIntegration';

class ConversationCardViewModel extends StoreViewModel<ConversationCardProps> {
  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  get hideText() {
    const { activityData } = this.post;
    return activityData && (activityData.object_id || activityData.key);
  }

  @computed
  get creator() {
    if (this.post.creatorId) {
      return getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        this.post.creatorId,
      );
    }
    return {} as PersonModel;
  }

  @computed
  get groupId() {
    return this.post.groupId;
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.groupId);
  }

  @computed
  get isArchivedGroup() {
    return !!this.group.isArchived;
  }

  @computed
  get showToast() {
    return !!this.isArchivedGroup;
  }

  @computed
  get itemTypeIds() {
    return this.post.itemTypeIds;
  }

  @computed
  get showProgressActions() {
    if (this.id < 0) {
      const progress = getEntity<Progress, ProgressModel>(
        ENTITY_NAME.PROGRESS,
        this.id,
      );
      return (
        progress.progressStatus === PROGRESS_STATUS.INPROGRESS ||
        progress.progressStatus === PROGRESS_STATUS.FAIL
      );
    }
    return false;
  }

  @computed
  get integrationItems() {
    if (this.post.itemIds) {
      return this.post.itemIds.filter((id: number) =>
        GlipTypeUtil.isIntegrationType(id),
      );
    }
    return [];
  }

  @computed
  get name() {
    // get name from items if this post is integration post
    // post -> itemIds -> isIntegration -> integrationItem.activity
    const userName = this.creator.userDisplayName || '';
    return getIntegration(this.post, userName) || userName;
  }

  @computed
  get createTime() {
    const { createdAt } = this.post;
    if (this.props.mode === 'navigation') {
      return dateFormatter.dateAndTime(moment(this.post.createdAt));
    }
    return postTimestamp(createdAt);
  }

  @computed
  get isEditMode() {
    const inEditModePostIds = getGlobalValue(GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS);
    return inEditModePostIds.includes(this.id);
  }

  @computed
  get showActivityStatus() {
    const { parentId, existItemIds } = this.post;

    return !parentId && Boolean(existItemIds.length);
  }

  @computed
  get repliedEntity() {
    const { parentId } = this.post;

    if (!parentId) {
      return null;
    }

    const { typeId, ...rest } = getEntity<Item, ItemModel>(
      ENTITY_NAME.ITEM,
      parentId,
    );

    if (!repliedEntityHandlers[typeId]) {
      return null;
    }

    return repliedEntityHandlers[typeId](rest);
  }
  @computed
  get colonsEmoji() {
    const status = this.creator.awayStatus || '';
    return getColonsEmoji(status);
  }
  @computed
  get statusPlainText() {
    const status = this.creator.awayStatus || '';

    return getStatusPlainText(status);
  }
}

export { ConversationCardViewModel };
