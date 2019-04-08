/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-20 09:35:17
 * Copyright © RingCentral. All rights reserved.
 */

import { ReLoginAuthenticator } from '../ReLoginAuthenticator';
import { AuthUserConfig } from '../../module/account/config';
import { loginGlip } from '../../api';
import notificationCenter from '../../service/notificationCenter';
import { SHOULD_UPDATE_NETWORK_TOKEN } from '../../service/constants';

jest.mock('../../module/account/config');
jest.mock('../../api');
jest.mock('../../service/notificationCenter');

describe('ReLoginAuthenticator', () => {
  let reLoginAuthenticator: ReLoginAuthenticator;
  beforeEach(() => {
    reLoginAuthenticator = new ReLoginAuthenticator();
  });
  describe('authenticate()', () => {
    it('should return false when rc token is invalid', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce(undefined);
      expect(await reLoginAuthenticator.authenticate({})).toEqual({
        success: false,
      });
    });

    it('should return false when login glip failed', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce('rcToken');
      loginGlip.mockImplementationOnce(() => {
        throw Error('error');
      });
      expect(await reLoginAuthenticator.authenticate({})).toEqual({
        success: false,
      });
    });

    it('should return true when login glip success', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce('rcToken');
      loginGlip.mockReturnValueOnce({
        headers: {
          'x-authorization': 'glipToken',
        },
      });
      expect(await reLoginAuthenticator.authenticate({})).toEqual({
        success: true,
        accountInfos: [
          {
            type: 'GlipAccount',
            data: 'glipToken',
          },
        ],
      });
      expect(notificationCenter.emit).toBeCalledWith(
        SHOULD_UPDATE_NETWORK_TOKEN,
        {
          glipToken: 'glipToken',
        },
      );
    });

    it('should return false when login glip failed', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce('rcToken');
      loginGlip.mockReturnValueOnce({
        status: 300,
        headers: {
          'x-authorization': 'glipToken',
        },
      });
      expect(await reLoginAuthenticator.authenticate({})).toEqual({
        success: false,
      });
    });
  });
});
