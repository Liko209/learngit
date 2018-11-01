/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-31 15:09:13
 * Copyright © RingCentral. All rights reserved.
 */

import getEscapeKeys from '../../Emoji/getEscapeKeys';

describe('Emoji getEscapeKeys', () => {
  it('getEscapeKeys', async () => {
    const keys = ['$', '(', ')', '*', '+', '.', '[', ']', '?', '/', '^', '{', '}', '|'];
    const result = getEscapeKeys(keys);
    const keysNew = keys.map((key: string) => `\\${key}`);
    expect(result).toEqual(keysNew);
  });
});
