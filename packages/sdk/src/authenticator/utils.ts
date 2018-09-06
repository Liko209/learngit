import { AuthDao, daoManager, ConfigDao } from '../dao';
import { AUTH_GLIP_TOKEN, AUTH_RC_TOKEN } from '../dao/auth/constants';
import { ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM } from './constants';

const setRcToken = async (token: object) => {
  const authDao = daoManager.getKVDao(AuthDao);
  await authDao.put(AUTH_RC_TOKEN, token);
  return true;
};

const setRcAccoutType = async () => {
  const configDao = daoManager.getKVDao(ConfigDao);
  await configDao.put(ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM.RC);
  return true;
};

const setGlipToken = async (token: string) => {
  const authDao = daoManager.getKVDao(AuthDao);
  await authDao.put(AUTH_GLIP_TOKEN, token);
  return true;
};

const setGlipAccoutType = async () => {
  const configDao = daoManager.getKVDao(ConfigDao);
  await configDao.put(ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM.GLIP);
  return true;
};

export { setRcToken, setRcAccoutType, setGlipToken, setGlipAccoutType };
