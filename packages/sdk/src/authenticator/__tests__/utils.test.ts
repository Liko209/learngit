/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 11:03:37
 * Copyright © RingCentral. All rights reserved.
 */

import {
  setRcToken,
  setRcAccountType,
  setGlipToken,
  setGlipAccountType,
} from '../utils';
import { GlobalConfigService } from '../../module/config';

jest.mock('../../service/account/config');
jest.mock('../../module/config/service/GlobalConfigService');
GlobalConfigService.getInstance = jest.fn();
jest.mock('../../service/auth/config');

describe('utils method', () => {
  it('setRcToken method set success should be true', async () => {
    const obj = { token: '123' };
    const result = await setRcToken(obj);
    expect(result).toBe(true);
  });

  it('setRcAccountType method set success should be true', async () => {
    const obj = { token: '123' };
    const result = await setRcAccountType();
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
