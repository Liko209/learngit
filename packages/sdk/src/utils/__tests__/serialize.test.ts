/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-16 08:35:57
 * Copyright © RingCentral. All rights reserved.
 */
import { serializeUrlParams, omitLocalProperties } from '../';
describe('serializeUrlParams()', () => {
  it('should return serialize string', () => {
    expect(serializeUrlParams({ name: 'aaa' })).toBe('name=aaa');
  });
});
describe('omitLocalProperties()', () => {
  it('should return object omit the __ properties', () => {
    expect(omitLocalProperties({ name: 'aaa', __123: '123' })).toEqual({
      name: 'aaa',
    });
  });

  it('should return array in which each item omit the __ properties', () => {
    expect(
      omitLocalProperties([
        { name: 'aaa', __123: '123' },
        { name: 'bbb', __123: '123' },
        { name: 'ccc', __123: '123' },
      ]),
    ).toEqual([{ name: 'aaa' }, { name: 'bbb' }, { name: 'ccc' }]);
  });
});
