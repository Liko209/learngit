/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-03 10:37:33
 * Copyright © RingCentral. All rights reserved.
 */
import { matchInvalidEmail } from '../index';

describe('matchInvalidEmail()', () => {
  it('should transform "This is not a valid email address: q@qq.com." to "q@qq.com"', () => {
    expect(
      matchInvalidEmail('This is not a valid email address: q@qq.com.'),
    ).toBe('q@qq.com');
  });
});
