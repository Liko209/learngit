import { AuthDao, daoManager, ConfigDao } from '../dao';
import { AUTH_GLIP_TOKEN, AUTH_RC_TOKEN } from '../dao/auth/constants';
import { ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM } from './constants';
import { ITokenModel } from '../api';

const setAccountType = async (type: any) => {
  const configDao = daoManager.getKVDao(ConfigDao);
  await configDao.put(ACCOUNT_TYPE, type);
  return true;
};

const setRcToken = async (token: ITokenModel) => {
  if (token.timestamp === undefined) {
    token.timestamp = Date.now();
  }
  const authDao = daoManager.getKVDao(AuthDao);
  await authDao.put(AUTH_RC_TOKEN, token);
  return true;
};

const setRcAccountType = async () => {
  return await setAccountType(ACCOUNT_TYPE_ENUM.RC);
};

const setGlipToken = async (token: string) => {
  const authDao = daoManager.getKVDao(AuthDao);
  await authDao.put(AUTH_GLIP_TOKEN, token);
  return true;
};

const setGlipAccountType = async () => {
  return await setAccountType(ACCOUNT_TYPE_ENUM.GLIP);
};

export { setRcToken, setRcAccountType, setGlipToken, setGlipAccountType };
