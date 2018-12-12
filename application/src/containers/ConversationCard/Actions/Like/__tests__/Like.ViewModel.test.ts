/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { serviceOk, serviceErr } from 'sdk/service/ServiceResult';
import { getEntity, getGlobalValue } from '../../../../../store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { LikeViewModel } from '../Like.ViewModel';

const mockPostService = {
  likePost: jest.fn(),
};
jest.mock('sdk/service/post', () => ({
  default: {
    getInstance: () => mockPostService,
  },
}));

jest.mock('../../../../../store/utils');

let likeViewModel: LikeViewModel;
const mockPostEntityData: {
  likes?: number[];
} = {};
const mockGlobalValue = {
  [GLOBAL_KEYS.CURRENT_USER_ID]: 1,
};

beforeAll(() => {
  (getEntity as jest.Mock).mockReturnValue(mockPostEntityData);
  (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
    return mockGlobalValue[key];
  });

  likeViewModel = new LikeViewModel({ id: 1 });
});

describe('likeViewModel', () => {
  it('lifecycle method', () => {
    expect(likeViewModel._id).toBe(1);
  });

  it('_post', () => {
    expect(likeViewModel._post).toBe(mockPostEntityData);
  });

  it('currentUserId', () => {
    expect(likeViewModel._currentUserId).toBe(
      mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID],
    );
  });

  it('isLike', () => {
    expect(likeViewModel.isLike).toBe(false);
    mockPostEntityData.likes! = [];
    expect(likeViewModel.isLike).toBe(false);
    mockPostEntityData.likes! = [mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID]];
    expect(likeViewModel.isLike).toBe(true);
  });

  describe('like()', () => {
    it('should like post', async () => {
      mockPostService.likePost.mockImplementation(() => serviceOk({}));

      const result = await likeViewModel.like(true);

      expect(result.isFailed).toBeFalsy();
      expect(mockPostService.likePost).toBeCalledWith(
        1,
        mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID],
        true,
      );
    });
    it('should unlike post', async () => {
      mockPostService.likePost.mockImplementation(() => serviceOk({}));
      const result = await likeViewModel.like(false);

      expect(result.isFailed).toBeFalsy();
      expect(mockPostService.likePost).toBeCalledWith(
        1,
        mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID],
        false,
      );
    });

    it('should return hasError=true when like failed', async () => {
      mockPostService.likePost.mockImplementation(() =>
        serviceErr(5300, 'mock error'),
      );
      const result = await likeViewModel.like(true);

      expect(result.isFailed).toBeTruthy();
      expect(mockPostService.likePost).toBeCalledWith(
        1,
        mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID],
        true,
      );
    });
  });
});
