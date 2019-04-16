/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-15 19:48:42
 * Copyright © RingCentral. All rights reserved.
 */

import { Post } from '../../entity/Post';
import { PostUtils } from '../PostUtils';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PostUtils', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('transformToPreInsertPost()', () => {
    beforeEach(() => {
      clearMocks();
    });

    const post1 = {
      id: 10,
      version: 100,
      unique_id: '100',
    } as Post;

    const post2 = {
      id: 10,
      version: 100,
      unique_id: '101',
    } as Post;

    it('should return original unique_id when unique id is version string', () => {
      expect(PostUtils.transformToPreInsertPost(post1).version).toBe(100);
    });

    it('should return original unique_id when unique id is version string', () => {
      expect(PostUtils.transformToPreInsertPost(post2).version).toBe(101);
    });
  });
});
