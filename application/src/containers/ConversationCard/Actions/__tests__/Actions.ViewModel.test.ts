/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import {
  getEntity,
  getGlobalValue,
  getSingleEntity,
} from '../../../../store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ActionsViewModel } from '../Actions.ViewModel';

const mockPostService = {
  likePost: jest.fn(),
  bookmarkPost: jest.fn(),
};
jest.mock('sdk/service/post', () => ({
  default: {
    getInstance: () => mockPostService,
  },
}));

jest.mock('../../../../store/utils');

let actionsViewModel: ActionsViewModel;
const mockPostEntityData: {
  likes?: number[];
} = {};
const mockGlobalValue = {
  [GLOBAL_KEYS.CURRENT_USER_ID]: 1,
  [GLOBAL_KEYS.NETWORK]: 'online',
};
const mockFavoritePostIds: number[] = [];

beforeAll(() => {
  (getEntity as jest.Mock).mockReturnValue(mockPostEntityData);
  (getSingleEntity as jest.Mock).mockReturnValue(mockFavoritePostIds);
  (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
    return mockGlobalValue[key];
  });

  actionsViewModel = new ActionsViewModel({ id: 1 });
});

describe('ActionsViewModel', () => {
  it('lifecycle method', () => {
    expect(actionsViewModel._id).toBe(1);
  });

  it('_post', () => {
    expect(actionsViewModel._post).toBe(mockPostEntityData);
  });

  it('_favoritePostIds', () => {
    expect(actionsViewModel._favoritePostIds).toBe(mockFavoritePostIds);
  });

  it('currentUserId', () => {
    expect(actionsViewModel._currentUserId).toBe(
      mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID],
    );
  });

  it('isOffline', () => {
    expect(actionsViewModel.isOffline).toBe(false);
    mockGlobalValue[GLOBAL_KEYS.NETWORK] = 'offline';
    expect(actionsViewModel.isOffline).toBe(true);
  });

  it('isLike', () => {
    expect(actionsViewModel.isLike).toBe(false);
    mockPostEntityData.likes! = [];
    expect(actionsViewModel.isLike).toBe(false);
    mockPostEntityData.likes! = [mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID]];
    expect(actionsViewModel.isLike).toBe(true);
  });

  it('isBookmark', () => {
    expect(actionsViewModel.isBookmark).toBe(false);
    mockFavoritePostIds.push(mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID]);
    expect(actionsViewModel.isBookmark).toBe(true);
  });

  it('like()', async () => {
    await actionsViewModel.like(true);
    expect(mockPostService.likePost).toBeCalledWith(
      1,
      mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID],
      true,
    );
    await actionsViewModel.like(false);
    expect(mockPostService.likePost).toBeCalledWith(
      1,
      mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID],
      false,
    );
  });

  it('bookmark()', async () => {
    await actionsViewModel.bookmark(true);
    expect(mockPostService.bookmarkPost).toBeCalledWith(1, true);
    await actionsViewModel.bookmark(false);
    expect(mockPostService.bookmarkPost).toBeCalledWith(1, false);
  });
});
