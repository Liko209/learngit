/*
 * @Author: steven.zhuang
 * @Date: 2018-11-13 20:39:34
 * Copyright © RingCentral. All rights reserved.
 */

import { SplitIOClient } from '../splitioClient';

describe('SplitIO Client', async () => {
  it('instance ', () => {
    const splictIO = new SplitIOClient(
      'auth',
      'test_id',
      { companyId: 123 },
      ['flagA'],
      null,
    );
    expect(splictIO).toBeInstanceOf(SplitIOClient);
  });
});
