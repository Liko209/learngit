/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-03 21:24:54
 * Copyright © RingCentral. All rights reserved.
 */

import { PinnedPostListHandler } from '../PinnedPostListHandler';
import { getEntity } from '@/store/utils';

jest.mock('mobx');
jest.mock('@/store/utils');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PinnedPostListHandler', () => {
  let pinnedPostListHandler: PinnedPostListHandler;
  function setUp() {
    pinnedPostListHandler = new PinnedPostListHandler(1, [1, 2, 3]);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('pinnedPostIds', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should filter useless ids', () => {
      pinnedPostListHandler = new PinnedPostListHandler(1, [
        1,
        2,
        null as any,
        3,
        null,
      ]);

      expect(pinnedPostListHandler['_sourceIds']).toEqual([1, 2, 3]);
    });

    it('should return pinned post ids ', () => {
      getEntity = jest.fn().mockReturnValue({
        id: 1,
        pinnedPostIds: [5, 6, 8],
      });

      expect(pinnedPostListHandler.pinnedPostIds).toEqual([5, 6, 8]);
    });
  });

  describe('dispose', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should call dispose for reaction', () => {
      const mockHandler = {
        dispose: jest.fn(),
      } as any;
      pinnedPostListHandler['_foc'] = mockHandler;

      const mockReaction: any = jest.fn();

      pinnedPostListHandler['_reactionDisposer'] = mockReaction;

      pinnedPostListHandler.dispose();
      expect(mockHandler.dispose).toBeCalled();
      expect(mockReaction).toBeCalled();
    });
  });
});
