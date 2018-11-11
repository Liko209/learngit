/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity, getGlobalValue } from '../../../../store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { FooterViewModel } from '../Footer.ViewModel';

const mockPostService = {
  likePost: jest.fn(),
};
jest.mock('sdk/service/post', () => ({
  default: {
    getInstance: () => mockPostService,
  },
}));

jest.mock('../../../../store/utils');

let footerViewModel: FooterViewModel;
const mockPostEntityData: {
  likes?: number[];
} = {};
const mockGlobalValue = {
  [GLOBAL_KEYS.CURRENT_USER_ID]: 1,
  [GLOBAL_KEYS.NETWORK]: 'online',
};

beforeAll(() => {
  (getEntity as jest.Mock).mockReturnValue(mockPostEntityData);
  (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
    return mockGlobalValue[key];
  });

  footerViewModel = new FooterViewModel({ id: 1 });
});

describe('footerViewModel', () => {
  it('lifecycle method', () => {
    expect(footerViewModel._id).toBe(1);
  });

  it('_post', () => {
    expect(footerViewModel._post).toBe(mockPostEntityData);
  });

  it('_currentUserId', () => {
    expect(footerViewModel._currentUserId).toBe(
      mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID],
    );
  });

  it('isOffline', () => {
    expect(footerViewModel.isOffline).toBe(false);
    mockGlobalValue[GLOBAL_KEYS.NETWORK] = 'offline';
    expect(footerViewModel.isOffline).toBe(true);
  });

  it('isLike', () => {
    expect(footerViewModel.isLike).toBe(false);
    mockPostEntityData.likes! = [];
    expect(footerViewModel.isLike).toBe(false);
    mockPostEntityData.likes! = [mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID]];
    expect(footerViewModel.isLike).toBe(true);
  });

  it('likeCount', () => {
    mockPostEntityData.likes! = [];
    expect(footerViewModel.likeCount).toBe(0);
    mockPostEntityData.likes! = [1, 2, 3, 4];
    expect(footerViewModel.likeCount).toBe(4);
  });

  it('like()', async () => {
    await footerViewModel.like(true);
    expect(mockPostService.likePost).toBeCalledWith(
      1,
      mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID],
      true,
    );
    await footerViewModel.like(false);
    expect(mockPostService.likePost).toBeCalledWith(
      1,
      mockGlobalValue[GLOBAL_KEYS.CURRENT_USER_ID],
      false,
    );
  });
});
