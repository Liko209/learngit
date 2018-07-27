/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:14:35
 * Copyright © RingCentral. All rights reserved
*/

import { AutoAuthenticator } from '../AutoAuthenticator';
import { AuthDao, daoManager, ConfigDao } from '../../dao';
import { ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM } from '../constants';
import { AUTH_GLIP_TOKEN, AUTH_RC_TOKEN } from '../../dao/auth/constants';

describe('AutoAuthenticator', () => {
  let autoAuthenticator = new AutoAuthenticator(daoManager);
  describe('user has not loggin', () => {
    const resp = autoAuthenticator.authenticate();
    expect(resp.success).toBe(false);
  });
  describe('GLIP user', () => {
    it('GLIP user type but has not token', () => {
      const configDao = daoManager.getKVDao(ConfigDao);
      configDao.put(ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM.GLIP);
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(false);
    });
    it('GLIP user type and has token', () => {
      const authDao = daoManager.getKVDao(AuthDao);
      authDao.put(AUTH_GLIP_TOKEN, 'glip_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(true);
    });
  });

  describe('RC user', () => {
    it('RC user type but has not token', () => {
      const configDao = daoManager.getKVDao(ConfigDao);
      configDao.put(ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM.RC);
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(false);
    });
    it('RC user type and has token', () => {
      const authDao = daoManager.getKVDao(AuthDao);
      authDao.put(AUTH_GLIP_TOKEN, 'glip_token');
      authDao.put(AUTH_RC_TOKEN, 'rc_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(true);
    });
  });
});
