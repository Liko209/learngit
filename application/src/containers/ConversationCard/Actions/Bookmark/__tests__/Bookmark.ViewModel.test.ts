/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { getSingleEntity } from '../../../../../store/utils';
import { BookmarkViewModel } from '../Bookmark.ViewModel';
import { serviceOk } from 'sdk/service/ServiceResult';

const mockPostService = {
  bookmarkPost: jest.fn(),
};
jest.mock('sdk/service/post', () => ({
  default: {
    getInstance: () => mockPostService,
  },
}));

jest.mock('../../../../../store/utils');

let bookmarkViewModel: BookmarkViewModel;

const mockFavoritePostIds: number[] = [];

beforeAll(() => {
  (getSingleEntity as jest.Mock).mockReturnValue(mockFavoritePostIds);

  bookmarkViewModel = new BookmarkViewModel({ id: 1 });
});

describe('ActionsViewModel', () => {
  it('lifecycle method', () => {
    expect(bookmarkViewModel._id).toBe(1);
  });

  it('_favoritePostIds', () => {
    expect(bookmarkViewModel._favoritePostIds).toBe(mockFavoritePostIds);
  });

  it('isBookmark', () => {
    expect(bookmarkViewModel.isBookmark).toBe(false);
    mockFavoritePostIds.push(bookmarkViewModel._id);
    expect(bookmarkViewModel.isBookmark).toBe(true);
  });

  it('bookmark()', async () => {
    mockPostService.bookmarkPost.mockResolvedValue(serviceOk({}));
    await bookmarkViewModel.bookmark(true);
    expect(mockPostService.bookmarkPost).toBeCalledWith(1, true);
    await bookmarkViewModel.bookmark(false);
    expect(mockPostService.bookmarkPost).toBeCalledWith(1, false);
  });
});
