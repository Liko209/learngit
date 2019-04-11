/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 11:03:37
 * Copyright © RingCentral. All rights reserved.
 */

import {
  setRCToken,
  setRCAccountType,
  setGlipToken,
  setGlipAccountType,
} from '../utils';

jest.mock('../../module/account/config');
jest.mock('../../module/config/service/GlobalConfigService');

describe('utils method', () => {
  it('setRCToken method set success should be true', async () => {
    const obj = { token: '123' };
    const result = await setRCToken(obj);
    expect(result).toBe(true);
  });

  it('setRCAccountType method set success should be true', async () => {
    const obj = { token: '123' };
    const result = await setRCAccountType();
    expect(result).toBe(true);
  });

  it('setGlipToken method set success should be true', async () => {
    const result = await setGlipToken('token');
    expect(result).toBe(true);
  });

  it('setGlipAccountType method set success should be true', async () => {
    const result = await setGlipAccountType();
    expect(result).toBe(true);
  });
});
