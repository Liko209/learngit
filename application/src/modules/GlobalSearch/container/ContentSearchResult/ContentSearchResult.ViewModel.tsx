/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-02 10:45:35,
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action, observable } from 'mobx';
import { container } from 'framework';
import { ContentSearchParams } from 'sdk/api/glip/search';
import { PostService } from 'sdk/module/post';
import { Post } from 'sdk/module/post/entity';
import { TypeDictionary } from 'sdk/utils/glip-type-dictionary';
import { StoreViewModel } from '@/store/ViewModel';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { GlobalSearchStore } from '../../store';
import { SEARCH_SCOPE } from '../../types';
import {
  ContentSearchId,
  ContentSearchState,
  ContentSearchOptions,
  ContentSearchResultProps,
  ContentSearchResultViewProps,
} from './types';

class ContentSearchResultViewModel
  extends StoreViewModel<ContentSearchResultProps>
  implements ContentSearchResultViewProps {
  private _currentGroupId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);

  private _postService: PostService = PostService.getInstance();

  private _globalSearchStore = container.get(GlobalSearchStore);

  @observable
  searchState: ContentSearchState = {
    requestId: null,
    postIds: [],
    postCount: 0,
  };

  @observable
  searchOptions: ContentSearchOptions = {
    fetch_count: 20,
  };

  constructor(props: ContentSearchResultProps) {
    super(props);

    this._onSearchInit();
  }

  @computed
  private get _searchKey(): string {
    return this._globalSearchStore.searchKey;
  }

  @computed
  private get _searchScope(): SEARCH_SCOPE {
    return this._globalSearchStore.searchScope;
  }

  @computed
  private get _searchParams(): ContentSearchParams {
    return Object.keys(this.searchOptions).reduce(
      (acc, key) =>
        this.searchOptions[key] === null
          ? acc
          : { ...acc, [key]: this.searchOptions[key] },
      {},
    );
  }

  @action
  setSearchOptions(options: ContentSearchOptions) {
    this.searchOptions = { ...this.searchOptions, ...options };

    this._onPostsInit();
  }

  onPostsFetch = async () => {
    const { requestId } = this.searchState;

    const fetchFn = requestId ? this._onPostsInit : this._onPostsScroll;

    const { posts, hasMore } = await fetchFn();

    this._updatePostIds(posts, requestId);

    return { posts, hasMore };
  }

  onSearchEnd = async () => {
    const { requestId } = this.searchState;

    requestId === null || (await this._postService.endPostSearch(requestId));
  }

  @action
  private _onSearchInit() {
    const q = this._searchKey;

    const group_id =
      this._searchScope === SEARCH_SCOPE.CONVERSATION
        ? this._currentGroupId
        : null;

    this.setSearchOptions({ q, group_id });
  }

  @action
  private _setSearchState(state = {}) {
    this.searchState = { ...this.searchState, ...state };
  }

  @action
  private _updatePostIds = (posts: Post[], requestId: ContentSearchId) => {
    const { postIds: fromPostIds } = this.searchState;

    const toPostIds = posts.map(({ id }) => id);

    const postIds =
      requestId === null ? toPostIds : [...fromPostIds, ...toPostIds];

    this._setSearchState({ postIds });
  }

  private _onPostsInit = async () => {
    const {
      [TypeDictionary.TYPE_ID_POST]: postCount,
    } = await this._postService.getSearchContentsCount(this._searchParams);

    this._setSearchState({ postCount, requestId: null });

    const result = await this._postService.searchPosts(this._searchParams);

    this._setSearchState({ requestId: result.requestId });

    return result;
  }

  private _onPostsScroll = async () => {
    const { requestId } = this.searchState;

    const result = await this._postService.scrollSearchPosts(
      requestId as number,
    );

    return result;
  }
}

export { ContentSearchResultViewModel };
