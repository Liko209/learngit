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
import { GlipTypeUtil } from 'sdk/utils';
import { Post } from 'sdk/models';
import config from './config';
import { ActivityViewProps, ActivityProps, ACTION } from './types';

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
  private get _itemIds() {
    return this._post.itemId ? [this._post.itemId] : this._post.itemIds;
  }
  @computed
  private get _typeIds() {
    const typeIds = {};
    this._itemIds.forEach((id: number) => {
      const typeId = GlipTypeUtil.extractTypeId(id);
      if (typeIds[typeId]) {
        typeIds[typeId].push(id);
      } else {
        typeIds[typeId] = [id];
      }
    });

    return typeIds;
  }

  @computed
  get _activityData() {
    const activity = {};
    Object.keys(this._typeIds).forEach((type: string) => {
      if (config[type]) {
        const { activityData, itemData } = this._post;
        const props = {
          activityData,
          itemData,
          ids: this._typeIds[type],
        };
        activity[type] = config[type](props);
      }
    });
    return activity;
  }

  @computed
  get activity() {
    const { source, parentId } = this._post;
    if (source) {
      return {
        action: ACTION.VIA,
        type: source,
      };
    }
    if (parentId) {
      return {
        action: ACTION.REPLIED,
      };
    }
    const types = Object.keys(this._activityData);
    if (types.length > 1) {
      return {
        action: ACTION.SHARED,
        type: -1,
      };
    }

    if (types.length) {
      return {
        ...this._activityData[types[0]],
        type: types[0],
      };
    }

    return {};
  }
}

export { ActivityViewModel };
