/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-03 10:45:35,
 * Copyright © RingCentral. All rights reserved.
 */
import { PostService } from 'sdk/module/post';
import { errorHelper } from 'sdk/error';
import { container } from 'framework';
import { getGlobalValue } from '@/store/utils';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { Notification } from '@/containers/Notification';
import { ContentSearchResultViewModel } from '../ContentSearchResult.ViewModel';
import { CONTENT_SEARCH_FETCH_COUNT } from '../types';
import { SEARCH_SCOPE } from '../../../types';

jest.mock('@/store/utils');

beforeEach(() => {
  const mockGlobalStore = {
    searchKey: 'searchKey',
    searchScope: SEARCH_SCOPE.GLOBAL,
  };
  container.get = jest.fn().mockReturnValue(mockGlobalStore);

  (<jest.Mock>getGlobalValue).mockImplementation(() => null);
});

describe('ContentSearchResult [JPT-1558]', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn();

    PostService.getInstance = jest.fn().mockReturnValue({
      searchPosts: jest.fn().mockRejectedValue(new Error('Init Error')),
      scrollSearchPosts: jest.fn().mockRejectedValue(new Error('Scroll Error')),
      getSearchContentsCount: jest.fn().mockResolvedValue(10),
    });
  });

  it('Should network error message be toasted when network error.', async () => {
    const vm = new ContentSearchResultViewModel({});

    jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(false);
    jest.spyOn(errorHelper, 'isNetworkConnectionError').mockReturnValue(true);

    await vm.onPostsFetch();

    expect(Notification.flashToast).toHaveBeenCalledWith({
      message: 'common.globalSearch.contentSearchNetworkError',
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
      message: 'common.globalSearch.contentSearchServiceError',
      dismissible: false,
      fullWidth: false,
      messageAlign: ToastMessageAlign.LEFT,
      type: ToastType.ERROR,
    });
  });
});

describe('ContentSearchResult [JPT-1562]', () => {
  it('Should posts be initialized after search options reset.', async () => {
    const vm = new ContentSearchResultViewModel({});

    const result = { requestId: 1, posts: [], hasMore: true };
    vm._onPostsInit = jest.fn().mockResolvedValueOnce(result);

    await vm.setSearchOptions({ creator_id: 1 });

    expect(vm._onPostsInit).toHaveBeenCalled();
  });

  it('Should fetch posts be scroll posts after posts initialized.', async () => {
    PostService.getInstance = jest.fn().mockReturnValue({
      getSearchContentsCount: jest.fn().mockResolvedValue(10),
      searchPosts: jest
        .fn()
        .mockResolvedValue({ requestId: 1, posts: [], hasMore: true }),
    });

    const vm = new ContentSearchResultViewModel({});

    const result = { requestId: 1, posts: [], hasMore: true };
    vm._onPostsScroll = jest.fn().mockResolvedValue(result);

    await vm.setSearchOptions({ creator_id: 1 });

    await vm.onPostsFetch();

    expect(vm._onPostsScroll).toHaveBeenCalled();
  });

  it('Should search options be filtered when has invalid property.', () => {
    const vm = new ContentSearchResultViewModel({});

    const fixedOptions = {
      q: 'searchKey',
      fetch_count: CONTENT_SEARCH_FETCH_COUNT,
    };
    const inputOptions = { type: null, creator_id: 1 };
    const outputOptions = { ...fixedOptions, creator_id: 1 };

    vm.setSearchOptions(inputOptions);

    expect(vm._searchParams).toStrictEqual(outputOptions);
  });
});
