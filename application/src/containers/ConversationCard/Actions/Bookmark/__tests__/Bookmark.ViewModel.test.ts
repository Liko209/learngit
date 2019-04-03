/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { getSingleEntity } from '../../../../../store/utils';
import { BookmarkViewModel } from '../Bookmark.ViewModel';

import { PostService } from 'sdk/module/post';

jest.mock('sdk/module/post');
jest.mock('../../../../../store/utils');

const postService = new PostService();
PostService.getInstance = jest.fn().mockReturnValue(postService);

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
    postService.bookmarkPost.mockResolvedValue({});
    await bookmarkViewModel.bookmark(true);
    expect(postService.bookmarkPost).toBeCalledWith(1, true);
    await bookmarkViewModel.bookmark(false);
    expect(postService.bookmarkPost).toBeCalledWith(1, false);
  });
});
