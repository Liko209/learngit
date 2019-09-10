/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-18 10:45:50
 * Copyright © RingCentral. All rights reserved.
 */
import { memoizeColor } from '../memoizeFunction';

jest.unmock('moize');

describe('memoizeColor()', () => {
  it('should return correct icon color', () => {
    expect(memoizeColor('primary', '900')).toEqual(['primary', '900']);
  });

  it('should memorize', () => {
    const color = memoizeColor('secondary', '600');
    expect(memoizeColor('secondary', '600')).toBe(color);
  });
});
