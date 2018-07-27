/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-16 08:35:57
 * Copyright © RingCentral. All rights reserved.
 */
import { serializeUrlParams } from '../';
describe('serializeUrlParams()', () => {
  it('should return serialize string', () => {
    expect(serializeUrlParams({ name: 'aaa' })).toBe('name=aaa');
  });
});
