/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-02-27 10:46:49
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { PinViewModel } from '../Pin.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { ENTITY_NAME } from '@/store';

const mockGroupService = {
  pinPost: jest.fn(),
};

ServiceLoader.getInstance = jest.fn().mockReturnValue(mockGroupService);

jest.mock('@/store/utils');

let pinViewModel: PinViewModel;
const mockGroupEntityData: {
  pinnedPostIds?: number[];
} = {};

const mockPost: {
  itemTypeIds: number[];
} = {
  itemTypeIds: [],
};

beforeAll(() => {
  (getEntity as jest.Mock).mockImplementation((name: string, id: number) => {
    if (name === ENTITY_NAME.GROUP) {
      return mockGroupEntityData;
    }
    return mockPost;
  });

  pinViewModel = new PinViewModel({ postId: 1, groupId: 2 });
});

describe('likeViewModel', () => {
  it('isPin', () => {
    expect(pinViewModel.isPin).toBe(false);
    mockGroupEntityData.pinnedPostIds! = [];
    expect(pinViewModel.isPin).toBe(false);
    mockGroupEntityData.pinnedPostIds! = [1];
    expect(pinViewModel.isPin).toBe(true);
  });

  describe('pin()', () => {
    it('should pin post', async () => {
      mockGroupService.pinPost.mockResolvedValue({});

      await pinViewModel.pin(true);

      expect(mockGroupService.pinPost).toBeCalledWith(1, 2, true);
    });
    it('should unlike post', async () => {
      mockGroupService.pinPost.mockResolvedValue({});
      await pinViewModel.pin(false);

      expect(mockGroupService.pinPost).toBeCalledWith(1, 2, false);
    });

    it('should return hasError=true when like failed', async () => {
      mockGroupService.pinPost.mockRejectedValueOnce({});
      await expect(pinViewModel.pin(true)).rejects.toEqual({});
      expect(mockGroupService.pinPost).toBeCalledWith(1, 2, true);
    });
  });

  describe('shouldDisablePinOption()', () => {
    it('should canPin', () => {
      (getEntity as jest.Mock).mockReturnValueOnce({ canPin: true });
      expect(pinViewModel.shouldDisablePinOption).toBe(false);
    });

    it('should not canPin', () => {
      (getEntity as jest.Mock).mockReturnValueOnce({ canPin: false });
      expect(pinViewModel.shouldDisablePinOption).toBe(true);
    });
  });

  describe('shouldShowPinOption()', () => {
    it('should show pin option', () => {
      expect(pinViewModel.shouldShowPinOption).toBe(true);
    });
  });
});
