/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 11:03:37
 * Copyright © RingCentral. All rights reserved.
 */

import { setRcToken, setRcAccoutType, setGlipToken, setGlipAccoutType } from '../utils';

describe('utils method', () => {
  it('setRcToken method set success should be true', async () => {
    const obj = { token: '123' };
    const result = await setRcToken(obj);
    expect(result).toBe(true);
  });

  it('setRcAccoutType method set success should be true', async () => {
    const obj = { token: '123' };
    const result = await setRcAccoutType();
    expect(result).toBe(true);
  });

  it('setGlipToken method set success should be true', async () => {
    const result = await setGlipToken('token');
    expect(result).toBe(true);
  });

  it('setGlipAccoutType method set success should be true', async () => {
    const result = await setGlipAccoutType();
    expect(result).toBe(true);
  });
});
