/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-09 13:12:42
 * Copyright © RingCentral. All rights reserved.
 */
import { getFileIcon } from '../helper';

describe('Conversation sheet helpers', () => {
  it('getFileIcon()', () => {
    const type = getFileIcon('xlsx');
    expect(type).toBe('sheet');
    const type1 = getFileIcon('xxx');
    expect(type1).toBeNull();
  });
});
