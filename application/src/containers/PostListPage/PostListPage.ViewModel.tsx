/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 13:42:41
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractViewModel } from '@/base';
import { POST_LIST_TYPE, PostListPageProps } from './types';
import { computed, observable } from 'mobx';
import { getSingleEntity } from '@/store/utils';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import { MyState } from 'sdk/module/state/entity';
import { Profile } from 'sdk/module/profile/entity';
import MyStateModel from '../../store/models/MyState';
import ProfileModel from '@/store/models/Profile';
import storeManager from '@/store';

type DataMap = {
  [key: string]: {
    caption: string;
    idListProvider: () => number[];
  };
};

class PostListPageViewModel extends AbstractViewModel {
  private _dataMap: DataMap = {
    [POST_LIST_TYPE.mentions]: {
      caption: 'message.@mentionsTitle',
      idListProvider: () => {
        const atMentionPostIds = getSingleEntity<MyState, MyStateModel>(
          ENTITY_NAME.MY_STATE,
          'atMentionPostIds',
        );
        if (Array.isArray(atMentionPostIds)) {
          return atMentionPostIds.sort((a: number, b: number) => b - a);
        }
        return [];
      },
    },
    [POST_LIST_TYPE.bookmarks]: {
      caption: 'message.bookmarksTitle',
      idListProvider: () => {
        const favoritePostIds = getSingleEntity<Profile, ProfileModel>(
          ENTITY_NAME.PROFILE,
          'favoritePostIds',
        );
        if (Array.isArray(favoritePostIds)) {
          return favoritePostIds.reverse();
        }
        return [];
      },
    },
  };

  @observable
  private _type: POST_LIST_TYPE;

  @computed
  get type(): POST_LIST_TYPE {
    return this._type;
  }

  @computed
  get caption(): string {
    if (this._type && this._dataMap[this._type]) {
      return this._dataMap[this._type].caption;
    }
    return '';
  }

  @computed
  get ids(): number[] {
    if (this._type && this._dataMap[this._type]) {
      return this._dataMap[this._type].idListProvider();
    }
    return [];
  }

  onReceiveProps(props: PostListPageProps) {
    if (
      Object.values(POST_LIST_TYPE).includes(props.type) &&
      this._type !== props.type
    ) {
      this._type = props.type as POST_LIST_TYPE;
      this._updateCurrentPostListValue();
    }
  }

  private _updateCurrentPostListValue() {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.CURRENT_POST_LIST_TYPE, this._type);
  }

  unsetCurrentPostListValue = () => {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.CURRENT_POST_LIST_TYPE, '');
  }
}

export { PostListPageViewModel };
