/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-02-27 10:46:49
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../store/utils';
import { PinViewModel } from '../Pin.ViewModel';
import { GroupService } from 'sdk/module/group';

const mockGroupService = {
  pinPost: jest.fn(),
};

GroupService.getInstance = jest.fn().mockReturnValue(mockGroupService);

jest.mock('../../../../../store/utils');

let pinViewModel: PinViewModel;
const mockGroupEntityData: {
  pinnedPostIds?: number[];
} = {};

beforeAll(() => {
  (getEntity as jest.Mock).mockReturnValue(mockGroupEntityData);

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
});
