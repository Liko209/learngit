/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-08 16:29:08
 * Copyright © RingCentral. All rights reserved.
 */
import PostModel from '@/store/models/Post';
import { ConversationCardProps } from '@/containers/ConversationCard/types';
import moment from 'moment';
import { computed } from 'mobx';
import { getEntity, getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { Post } from 'sdk/module/post/entity';
import { Person } from 'sdk/module/person/entity';
import { Progress, PROGRESS_STATUS } from 'sdk/module/progress/entity';
import { ENTITY_NAME } from '@/store';
import { postTimestamp, dateFormatter } from '@/utils/date';
import PersonModel from '@/store/models/Person';
import { StoreViewModel } from '@/store/ViewModel';
import ProgressModel from '@/store/models/Progress';
import { container } from 'framework';
import { GlobalSearchService } from '@/modules/GlobalSearch/service';
import { GlobalSearchStore } from '@/modules/GlobalSearch/store';

class ConversationCardViewModel extends StoreViewModel<ConversationCardProps> {
  private _globalSearchService = container.get(GlobalSearchService);
  private _globalSearchStore = container.get(GlobalSearchStore);

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
  get name() {
    return this.creator.userDisplayName;
  }

  @computed
  get customStatus() {
    return this.creator.awayStatus;
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
    return !!(this.post.parentId || this.post.existItemIds.length);
  }

  beforeJump = () => {
    this._globalSearchStore.open &&
      this._globalSearchService.closeGlobalSearch();
  }
}

export { ConversationCardViewModel };
