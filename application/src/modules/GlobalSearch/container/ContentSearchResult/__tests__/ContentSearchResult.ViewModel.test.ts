/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-03 10:45:35,
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { errorHelper } from 'sdk/error';
import { Post } from 'sdk/module/post/entity';
import { getGlobalValue } from '@/store/utils';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { Notification } from '@/containers/Notification';
import { ContentSearchResultViewModel } from '../ContentSearchResult.ViewModel';
import { CONTENT_SEARCH_FETCH_COUNT } from '../types';
import { SEARCH_SCOPE } from '../../../types';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { TypeDictionary } from 'sdk/utils';
import { ESearchContentTypes } from 'sdk/api/glip/search';
import { PostService } from 'sdk/module/post';
import * as config from '../../SearchFilter/config';
import storeManager, { ENTITY_NAME } from '@/store';

jest.mock('@/store/utils');

beforeEach(() => {
  const mockGlobalStore = {
    searchKey: 'searchKey',
    searchScope: SEARCH_SCOPE.GLOBAL,
  };
  container.get = jest.fn().mockReturnValue(mockGlobalStore);

  (<jest.Mock>getGlobalValue).mockImplementation(() => null);

  storeManager.dispatchUpdatedDataModels = jest.fn();
});

describe('ContentSearchResult [JPT-1558]', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn();

    const postService = {
      searchPosts: jest.fn().mockRejectedValue(new Error('Init Error')),
      scrollSearchPosts: jest.fn().mockRejectedValue(new Error('Scroll Error')),
      getSearchContentsCount: jest.fn().mockResolvedValue({}),
    };

    ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);
  });

  it('Should network error message be toasted when network error.', async () => {
    const vm = new ContentSearchResultViewModel({});

    jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(false);
    jest.spyOn(errorHelper, 'isNetworkConnectionError').mockReturnValue(true);

    await vm.onPostsFetch();

    expect(Notification.flashToast).toHaveBeenCalledWith({
      message: 'globalSearch.prompt.contentSearchNetworkError',
      dismissible: false,
      fullWidth: false,
      messageAlign: ToastMessageAlign.LEFT,
      type: ToastType.ERROR,
    });
  });

  it('Should service error message be toasted when service error.', async () => {
    const vm = new ContentSearchResultViewModel({});

    jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(true);
    jest.spyOn(errorHelper, 'isNetworkConnectionError').mockReturnValue(false);

    await vm.onPostsFetch();

    expect(Notification.flashToast).toHaveBeenCalledWith({
      message: 'globalSearch.prompt.contentSearchServiceError',
      dismissible: false,
      fullWidth: false,
      messageAlign: ToastMessageAlign.LEFT,
      type: ToastType.ERROR,
    });
  });
});

describe('ContentSearchResult [JPT-1562]', () => {
  beforeEach(() => {
    const postService = {
      endPostSearch: jest.fn().mockResolvedValue(null),
      getSearchContentsCount: jest.fn().mockResolvedValue({}),
      searchPosts: jest
        .fn()
        .mockResolvedValue({ requestId: 1, posts: [], hasMore: true }),
    };

    ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);
  });

  it('Should posts be initialized after search options reset.', async () => {
    const vm = new ContentSearchResultViewModel({});

    const result = { requestId: 1, posts: [], hasMore: true };
    vm._onPostsInit = jest.fn().mockResolvedValue(result);

    await vm.onPostsFetch();

    expect(vm._onPostsInit).toHaveBeenCalled();
  });

  it('Should fetch posts be scroll posts after posts initialized.', async () => {
    const vm = new ContentSearchResultViewModel({});

    const result = { requestId: 1, posts: [], hasMore: true };
    vm._onPostsScroll = jest.fn().mockResolvedValue(result);

    await vm.onPostsFetch();

    await vm.onPostsFetch();

    expect(vm._onPostsScroll).toHaveBeenCalled();
  });

  it('Should search options be filtered when has invalid property.', () => {
    const vm = new ContentSearchResultViewModel({});

    const fixedOptions = {
      q: 'searchKey',
      scroll_size: CONTENT_SEARCH_FETCH_COUNT,
    };
    const inputOptions = { type: null, creator_id: 1 };
    const outputOptions = { ...fixedOptions, creator_id: 1 };

    vm.setSearchOptions(inputOptions);

    expect(vm._searchParams).toStrictEqual(outputOptions);
  });
});

describe('ContentSearchResult fix(FIJI-4865)', () => {
  it('Should post ids be negative order when update post ids.', () => {
    const vm = new ContentSearchResultViewModel({});

    const fromIds = [3, 1];
    const toIds = [{ id: 2 }, { id: 4 }];

    vm._setSearchState({ postIds: fromIds });

    vm._updatePostIds(<Post[]>toIds);

    expect(vm.searchState.postIds).toStrictEqual([4, 3, 2, 1]);
  });
});

describe('ContentSearchResult.ViewModel', () => {
  beforeEach(() => {
    const postService = {
      endPostSearch: jest.fn().mockResolvedValue(null),
      getSearchContentsCount: jest.fn().mockResolvedValue({}),
      searchPosts: jest
        .fn()
        .mockResolvedValue({ requestId: 1, posts: [], hasMore: true }),
    };

    ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);
  });

  it('Should reset contentCounts when setSearchOptions is called on the empty screen', async () => {
    const vm = new ContentSearchResultViewModel({});
    vm.searchState.requestId = 1123; // mock previous request id before set new search option
    vm.searchState.contentsCount = {
      [TypeDictionary.TYPE_ID_POST]: 0,
    };
    expect(vm.isEmpty).toBe(true);
    await vm.setSearchOptions({});
    expect(vm.isEmpty).toBe(false);
  });
});

describe('ContentSearchResult fix(FIJI-4990)', () => {
  let postService: PostService;
  beforeEach(() => {
    postService = {
      endPostSearch: jest.fn().mockResolvedValue(null),
      getSearchContentsCount: jest.fn().mockResolvedValue({}),
      searchPosts: jest
        .fn()
        .mockResolvedValue({ requestId: 1, posts: [], hasMore: true }),
    };

    ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);
  });
  it('Should not call count service with the "type" param', async () => {
    const vm = new ContentSearchResultViewModel({});

    vm.setSearchOptions({
      type: ESearchContentTypes.ALL,
    });

    await vm.onPostsFetch();
    expect(postService.getSearchContentsCount).toHaveBeenCalledWith(
      expect.not.objectContaining({ type: ESearchContentTypes }),
    );
  });

  it('postsCount should change with the "type" search option', async () => {
    const vm = new ContentSearchResultViewModel({});

    postService.getSearchContentsCount.mockResolvedValue({
      [TypeDictionary.TYPE_ID_POST]: 12,
      [TypeDictionary.TYPE_ID_EVENT]: 3,
    });

    await vm.onPostsFetch();

    vm.setSearchOptions({
      type: ESearchContentTypes.ALL,
    });
    expect(vm.postsCount).toBe(15); // ALL -> use sum [bug/FIJI-4870]

    vm.setSearchOptions({
      type: ESearchContentTypes.EVENTS,
    });
    expect(vm.postsCount).toBe(3); // EVENT -> use event's count

    vm.setSearchOptions({
      type: ESearchContentTypes.CHATS,
    });
    expect(vm.postsCount).toBe(12); // CHATS -> use post's count
  });
});

describe('ContentSearchResult fix(FIJI-4870)', () => {
  let postService: PostService;
  beforeEach(() => {
    postService = {
      endPostSearch: jest.fn().mockResolvedValue(null),
      getSearchContentsCount: jest.fn().mockResolvedValue({}),
      searchPosts: jest
        .fn()
        .mockResolvedValue({ requestId: 1, posts: [], hasMore: true }),
    };

    ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);
  });

  it('Should add new property to the contentCounts from service, the value should be sum of counts of all displayed types', async () => {
    config.TYPE_MAP = [
      {
        id: TypeDictionary.TYPE_ID_POST,
      },
      {
        id: TypeDictionary.TYPE_ID_FILE,
      },
      {
        id: TypeDictionary.TYPE_ID_TASK,
      },
    ];
    postService.getSearchContentsCount.mockResolvedValue({
      [TypeDictionary.TYPE_ID_POST]: 12,
      [TypeDictionary.TYPE_ID_EVENT]: 3,
      [TypeDictionary.TYPE_ID_FILE]: 1,
      [TypeDictionary.TYPE_ID_TASK]: 5,
    });

    const vm = new ContentSearchResultViewModel({});
    await vm.onPostsFetch();

    expect(vm.searchState.contentsCount[-1]).toBe(18);
  });
});
