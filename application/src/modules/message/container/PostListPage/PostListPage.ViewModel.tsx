/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 13:42:41
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractViewModel } from '@/base';
import { POST_LIST_TYPE, PostListPageProps } from './types';
import { computed, observable } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';

import _ from 'lodash';
import { PostService } from 'sdk/module/post';
import { QUERY_DIRECTION } from 'sdk/dao';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { Post } from 'sdk/module/post/entity';
import { ISortableModelWithData } from '@/store/base/fetch/types';
import PostModel from '@/store/models/Post';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import SingleEntityMapStore from '@/store/base/SingleEntityMapStore';

class PostListPageViewModel extends AbstractViewModel {
  @computed
  get atMentionPostIds() {
    const store = storeManager.getEntityMapStore(
      ENTITY_NAME.MY_STATE,
    ) as SingleEntityMapStore<any, any>;

    const isMocked = store.get('isMocked');
    if (isMocked) {
      return undefined;
    }
    const atMentionPostIds = store.get('atMentionPostIds');
    if (Array.isArray(atMentionPostIds)) {
      return atMentionPostIds.reverse();
    }
    return [];
  }

  @computed
  get favoritePostIds() {
    const store = storeManager.getEntityMapStore(
      ENTITY_NAME.PROFILE,
    ) as SingleEntityMapStore<any, any>;
    const isMocked = store.get('isMocked');
    if (isMocked) {
      return undefined;
    }
    const favoritePostIds = store.get('favoritePostIds');
    if (Array.isArray(favoritePostIds)) {
      return favoritePostIds;
    }
    return [];
  }

  @computed
  private get _dataMap() {
    return {
      [POST_LIST_TYPE.mentions]: {
        caption: 'message.@mentionsTitle',
        idListProvider: this.atMentionPostIds,
      },
      [POST_LIST_TYPE.bookmarks]: {
        caption: 'message.bookmarksTitle',
        idListProvider: this.favoritePostIds,
      },
    };
  }

  @observable
  private _type: POST_LIST_TYPE;

  @computed
  get kind(): POST_LIST_TYPE {
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
  get ids(): number[] | undefined {
    if (this._type && this._dataMap[this._type]) {
      return this._dataMap[this._type].idListProvider;
    }
    return undefined;
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
  };

  private _getDataByIds = async (ids: number[]) => {
    const postsStore = storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore<Post, PostModel>;
    const [idsOutOfStore, idsInStore] = postsStore.subtractedBy(ids);
    let postsFromService: Post[] = [];
    const postsFromStore = idsInStore
      .map(id => getEntity<Post, PostModel>(ENTITY_NAME.POST, id))
      .filter((post: PostModel) => !post.deactivated);

    if (idsOutOfStore.length) {
      const postService = ServiceLoader.getInstance<PostService>(
        ServiceConfig.POST_SERVICE,
      );
      const results = await postService.getPostsByIds(idsOutOfStore);
      postsFromService = results.posts.filter(
        (post: Post) => !post.deactivated,
      );
    }
    return [...postsFromService, ...postsFromStore];
  };

  private _getOnePageData = async (
    start: number,
    pageSize: number,
  ): Promise<{ data: (Post | PostModel)[]; hasMore: boolean }> => {
    if (this.ids === undefined) {
      return { data: [], hasMore: true };
    }
    /* eslint-disable */
    const data = [];
    let currentIds = [];
    let currentStart = start;
    let currentEnd = start + pageSize;
    let lengthDiff = 0;
    do {
      currentIds = _(this.ids)
        .slice(currentStart, currentEnd)
        .value();
      const temp = await this._getDataByIds(currentIds);
      data.push(...temp);
      currentStart = currentEnd;
      lengthDiff = pageSize - data.length;
      currentEnd = currentEnd + lengthDiff;
    } while (lengthDiff && currentStart < this.ids.length);
    const hasMore = data.length === pageSize && currentEnd < this.ids.length;
    return { data, hasMore };
  };

  postFetcher = async (
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModelWithData<Post>,
  ) => {
    let start = 0;
    if (anchor) {
      const index = _(this.ids).indexOf(anchor.id);
      start = index + 1;
    }
    return await this._getOnePageData(start, pageSize);
  };
}

export { PostListPageViewModel };
