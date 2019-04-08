/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-02 10:45:35,
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action, observable } from 'mobx';
import { container } from 'framework';
import { ContentSearchParams } from 'sdk/api/glip/search';
import { PostService } from 'sdk/module/post';
import { SearchedResultData } from 'sdk/module/post/controller/implementation/types';
import { Post } from 'sdk/module/post/entity';
import { TypeDictionary } from 'sdk/utils/glip-type-dictionary';
import { errorHelper } from 'sdk/error';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { Notification } from '@/containers/Notification';
import { generalErrorHandler } from '@/utils/error';
import { StoreViewModel } from '@/store/ViewModel';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { GlobalSearchStore } from '../../store';
import { SEARCH_SCOPE } from '../../types';
import {
  ContentSearchState,
  ContentSearchOptions,
  ContentSearchResultProps,
  ContentSearchResultViewProps,
  CONTENT_SEARCH_FETCH_COUNT,
} from './types';

class ContentSearchResultViewModel
  extends StoreViewModel<ContentSearchResultProps>
  implements ContentSearchResultViewProps {
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
    scroll_size: CONTENT_SEARCH_FETCH_COUNT,
  };

  constructor(props: ContentSearchResultProps) {
    super(props);

    this._onSearchInit();
  }

  @computed
  private get _searchKey(): string {
    // return this._globalSearchStore.searchKey;
    return '123';
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
  setSearchOptions = async (options: ContentSearchOptions) => {
    this.searchOptions = { ...this.searchOptions, ...options };

    if (this.searchState.requestId) {
      await this.onSearchEnd();
      this._setSearchState({ requestId: null });
    }
  }

  onPostsFetch = async () => {
    const { requestId } = this.searchState;
    const isInitialize = requestId === null;

    const fetchFn = isInitialize ? this._onPostsInit : this._onPostsScroll;

    const { posts, hasMore } = await this._fetchHandleWrapper(fetchFn);

    this._updatePostIds(posts, isInitialize);

    return { hasMore, data: posts };
  }

  onSearchEnd = async () => await this._postService.endPostSearch();

  @action
  private _onSearchInit() {
    const q = this._searchKey;
    const currentGroupId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);

    const group_id =
      this._searchScope === SEARCH_SCOPE.CONVERSATION ? currentGroupId : null;

    this.setSearchOptions({ q, group_id });
  }

  @action
  private _setSearchState(state = {}) {
    this.searchState = { ...this.searchState, ...state };
  }

  @action
  private _updatePostIds = (posts: Post[], isInitialize: boolean = false) => {
    const { postIds: fromPostIds } = this.searchState;

    const toPostIds = posts.map(({ id }) => id);

    const postIds = isInitialize ? toPostIds : [...fromPostIds, ...toPostIds];

    this._setSearchState({ postIds });
  }

  private _onPostsInit = async () => {
    const {
      [TypeDictionary.TYPE_ID_POST]: postCount,
    } = await this._postService.getSearchContentsCount({
      ...this._searchParams,
      count_types: 1,
    });

    const result = await this._postService.searchPosts(this._searchParams);

    this._setSearchState({ postCount, requestId: result.requestId });

    return result;
  }

  private _onPostsScroll = async () => {
    const { requestId } = this.searchState;

    const result = await this._postService.scrollSearchPosts(
      requestId as number,
    );

    return result;
  }

  private _fetchHandleWrapper = async (
    fetchFn: () => Promise<SearchedResultData>,
  ) => {
    let result;

    try {
      result = await fetchFn();
    } catch (error) {
      this._fetchErrorHandler(error);

      result = { hasMore: true, posts: [] };
    }

    return result;
  }

  private _fetchErrorHandler(error: Error) {
    const isServiceError = errorHelper.isBackEndError(error);
    const isNetworkError = errorHelper.isNetworkConnectionError(error);
    const isResponseError = isServiceError || isNetworkError;

    let message: string = 'common.globalSearch.prompt';

    isServiceError && (message = `${message}.contentSearchServiceError`);

    isNetworkError && (message = `${message}.contentSearchNetworkError`);

    isResponseError
      ? Notification.flashToast({
        message,
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      })
      : generalErrorHandler(error);
  }
}

export { ContentSearchResultViewModel };
