/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-02 10:45:35,
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action, observable } from 'mobx';
import { container } from 'framework';
import { ContentSearchParams, ESearchContentTypes } from 'sdk/api/glip/search';
import { PostService } from 'sdk/module/post';
import { SearchedResultData } from 'sdk/module/post/controller/implementation/types';
import { Post } from 'sdk/module/post/entity';
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
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { TypeDictionary } from 'sdk/utils';

class ContentSearchResultViewModel
  extends StoreViewModel<ContentSearchResultProps>
  implements ContentSearchResultViewProps {
  private _postService = ServiceLoader.getInstance<PostService>(
    ServiceConfig.POST_SERVICE,
  );

  private _globalSearchStore = container.get(GlobalSearchStore);

  private _stream: any;

  @observable
  isEmpty: boolean = false;

  @observable
  searchState: ContentSearchState = {
    requestId: null,
    postIds: [],
    contentsCount: {},
  };

  @observable
  searchOptions: ContentSearchOptions = {
    scroll_size: CONTENT_SEARCH_FETCH_COUNT,
    type: ESearchContentTypes.ALL,
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
  setSearchOptions = async (options: ContentSearchOptions) => {
    this.searchOptions = { ...this.searchOptions, ...options };

    await this.onSearchEnd();

    const previousRequestId = this.searchState.requestId;

    this._setSearchState({ requestId: null });

    if (previousRequestId) {
      this._stream.current.vm.reInit();
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
    Object.assign(this.searchState, state);
  }

  @action
  private _updatePostIds = (posts: Post[], isInitialize: boolean = false) => {
    const { postIds: fromPostIds } = this.searchState;

    const toPostIds = posts.map(({ id }) => id);

    const postIds = isInitialize ? toPostIds : [...fromPostIds, ...toPostIds];

    postIds.sort((former, latter) => latter - former);

    this._setSearchState({ postIds });
  }

  private _onPostsInit = async () => {
    const contentsCount = await this._postService.getSearchContentsCount(
      this._searchParams,
    );

    const result = await this._postService.searchPosts(this._searchParams);

    this._setSearchState({ contentsCount, requestId: result.requestId });

    const count = contentsCount[TypeDictionary.TYPE_ID_POST] || 0;
    this.isEmpty = count === 0;

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

    let message: string = 'globalSearch.prompt';

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

  setStreamVM = (stream: any) => {
    this._stream = stream;
  }
}

export { ContentSearchResultViewModel };
