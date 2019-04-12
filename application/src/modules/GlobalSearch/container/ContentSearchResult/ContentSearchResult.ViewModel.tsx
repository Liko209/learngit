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
import { TYPE_MAP } from '../SearchFilter/config';
import _ from 'lodash';
import storeManager, { ENTITY_NAME } from '@/store';

const TYPE_ALL = -1;

class ContentSearchResultViewModel
  extends StoreViewModel<ContentSearchResultProps>
  implements ContentSearchResultViewProps {
  private _postService = ServiceLoader.getInstance<PostService>(
    ServiceConfig.POST_SERVICE,
  );

  private _globalSearchStore = container.get(GlobalSearchStore);

  private _stream: any;

  @computed
  get _type() {
    const typeData = TYPE_MAP.find(
      ({ value }) => value === this.searchOptions.type,
    );
    return typeData && typeData.id ? typeData.id : TYPE_ALL;
  }

  @computed
  get postsCount() {
    return this.searchState.contentsCount[this._type] || 0;
  }

  @computed
  get isEmpty() {
    return !!(this.searchState.requestId && !this.postsCount);
  }

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

    previousRequestId && this._refresh();
  }

  onPostsFetch = async () => {
    const { requestId } = this.searchState;
    const isInitialize = requestId === null;

    const fetchFn = isInitialize ? this._onPostsInit : this._onPostsScroll;

    const { posts, items, hasMore } = await this._fetchHandleWrapper(fetchFn);

    storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, items);

    this._updatePostIds(posts, isInitialize);

    return { hasMore, data: posts };
  }

  onSearchEnd = async () => await this._postService.endPostSearch();

  private _refresh() {
    if (!this.isEmpty && this._stream && this._stream.current) {
      this._stream.current.vm.reInit();
    } else {
      this._setSearchState({ contentsCount: {} });
    }
  }

  @action
  private _onSearchInit() {
    const q = this._searchKey;
    const currentGroupId = this._globalSearchStore.groupId;

    const group_id =
      this._searchScope === SEARCH_SCOPE.CONVERSATION ? currentGroupId : null;

    this.setSearchOptions({ q, group_id });
  }

  @action
  private _setSearchState(state: Partial<ContentSearchState> = {}) {
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
      _.omit(this._searchParams, 'type'),
    );

    contentsCount[TYPE_ALL] = _.sum(
      Object.values(_.pick(contentsCount, ...TYPE_MAP.map(({ id }) => id))),
    );

    const result = await this._postService.searchPosts(this._searchParams);

    this._setSearchState({ contentsCount, requestId: result.requestId });

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

      result = { hasMore: true, posts: [], items: [] };
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
