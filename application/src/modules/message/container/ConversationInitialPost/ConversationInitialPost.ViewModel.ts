/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-29 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable } from 'mobx';
import { ConversationInitialPostViewProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import StoreViewModel from '@/store/ViewModel';
import { dateFormatter } from '@/utils/date';
import moment from 'moment';

class ConversationInitialPostViewModel extends StoreViewModel<
  ConversationInitialPostViewProps
> {
  @observable
  creatorGroupId: number;

  @computed
  get groupId() {
    return this.props.id;
  }

  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.groupId) as GroupModel;
  }

  @computed
  get isCompanyTeam() {
    return this._group.isCompanyTeam;
  }

  @computed
  get displayName() {
    const arr = String(this._group.displayName).split(',');
    if (arr.length > 1) {
      arr.splice(
        arr.length - 2,
        2,
        `${arr[arr.length - 2]} and ${arr[arr.length - 1]}`,
      );
      return arr.join(',');
    }
    return this._group.displayName;
  }

  @computed
  get groupType() {
    return this._group.type;
  }

  @computed
  get groupDescription() {
    return this._group.description;
  }

  @computed
  get creator() {
    return this._group.creator;
  }

  @computed
  get isTeam() {
    return this._group.isTeam;
  }

  @computed
  get createTime() {
    const { createdAt } = this._group;
    return dateFormatter.dateAndTime(moment(createdAt));
  }
}

export { ConversationInitialPostViewModel };
