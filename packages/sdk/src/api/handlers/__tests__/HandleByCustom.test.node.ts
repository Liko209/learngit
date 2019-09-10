/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-18 12:26:44
 * Copyright © RingCentral. All rights reserved.
 */

import HandleByCustom from '../HandleByCustom';
import { AbstractHandleType } from 'foundation/network';

describe('HandleByCustom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('HandleByCustom()', () => {
    it('should be sub class of AbstractHandleType', () => {
      expect(HandleByCustom).toBeInstanceOf(AbstractHandleType);
    });
  });
});
