/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-01 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { MAX_SCALE, MIN_SCALE } from '../PhotoEdit.View';

describe('PhotoEditViewModel', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('scale range', () => {
    it('Should scale range from 1 to 5 [JPT-2624]', () => {
      expect(MIN_SCALE).toEqual(1);
      expect(MAX_SCALE).toEqual(5);
    });
  });
});
