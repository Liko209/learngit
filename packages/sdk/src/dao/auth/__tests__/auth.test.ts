/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 21:45:41
 */
import { AUTH_GLIP_TOKEN, AUTH_RC_TOKEN } from '../../auth/constants';
import { setupKV } from '../../__tests__/utils';
import AuthDao from '../';

const VALUE = 'test';

describe('AuthDao', () => {
  let authDao: AuthDao;
  beforeAll(() => {
    const { kvStorage } = setupKV();
    authDao = new AuthDao(kvStorage);
  });

  it('get/set auth key', () => {
    authDao.put(AUTH_GLIP_TOKEN, VALUE);
    expect(authDao.get(AUTH_GLIP_TOKEN)).toBe(VALUE);

    authDao.put(AUTH_RC_TOKEN, VALUE);
    expect(authDao.get(AUTH_RC_TOKEN)).toBe(VALUE);

    authDao.clear();
    expect(authDao.get(AUTH_GLIP_TOKEN)).toBeNull();
  });
});
