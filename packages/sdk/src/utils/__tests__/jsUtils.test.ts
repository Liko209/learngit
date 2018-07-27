import { uniqueArray } from '../jsUtils';

describe('jsUtils', () => {
  it('uniqueArray()', () => {
    let arr = [1, 2, 3, 3, '3'];
    expect(uniqueArray(arr)).toEqual([1, 2, 3, '3']);
  });
});
