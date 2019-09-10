/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-13 15:53:22
 * Copyright © RingCentral. All rights reserved.
 */

import { extractHiddenGroupIds } from '../ProfileUtils';
import { Profile } from '../../entity/Profile';

describe('ProfileUtils', () => {
  describe('extractHiddenGroupIds', () => {
    it('should return empty array when there are not hidden groups', () => {
      const fakeProfile = {
        id: 2,
        hide_group_123123: false,
      };
      const result = extractHiddenGroupIds(fakeProfile as Profile);
      expect(result.length).toEqual(0);
    });
    it('should return all hidden group ids when it has hidden groups', () => {
      const fakeProfile = {
        id: 2,
        hide_group_1: true,
        hide_group_2: false,
        hide_group_3: true,
      };
      const result = extractHiddenGroupIds(fakeProfile as Profile);
      expect(result).toEqual([1, 3]);
    });
  });
});
