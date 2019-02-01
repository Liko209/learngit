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
import config from './config';
import { ActivityViewProps, ActivityProps } from './types';

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
  get activity() {
    const { parentId } = this._post;
    const types = Object.keys(this._activityData);
    let activity: any = {};
    switch (true) {
      case types.length > 1:
        activity = config.items();
        break;
      case !!types.length:
        activity = this._activityData[types[0]];
        break;
      case !!parentId:
        activity = config.children();
        break;
    }
    return activity;
  }
}

export { ActivityViewModel };
