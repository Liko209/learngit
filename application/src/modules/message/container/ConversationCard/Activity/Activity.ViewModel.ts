/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 10:26:34
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import StoreViewModel from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { ENTITY_NAME } from '@/store';
import { Post } from 'sdk/module/post/entity';
import { ActivityViewProps, ActivityProps } from './types';
import { getActivityData, getActivity } from './handler/getActivity';

class ActivityViewModel extends StoreViewModel<ActivityProps>
  implements ActivityViewProps {
  @computed
  private get _id() {
    return this.props.id;
  }
  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  private get _activityData() {
    return getActivityData(this._post);
  }

  @computed
  get activity() {
    return getActivity(this._post, this._activityData);
  }
}

export { ActivityViewModel };
