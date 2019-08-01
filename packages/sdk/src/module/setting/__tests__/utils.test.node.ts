/*
 * @Author: Paynter Chen
 * @Date: 2019-05-28 13:00:42
 * Copyright © RingCentral. All rights reserved.
 */

import { findFirst } from '../utils';
describe('utils', () => {
  describe('findFirst()', () => {
    it('', async () => {
      const first = await findFirst(
        [() => undefined, () => 1],
        async item => await item(),
        result => !!result,
      );
      expect(first).toEqual(1);
    });
  });
});
