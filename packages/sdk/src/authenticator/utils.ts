import { ACCOUNT_TYPE_ENUM } from './constants';
import { ITokenModel } from '../api';
import { AuthUserConfig } from '../service/auth/config';
import { AccountUserConfig } from '../service/account/config';

const setAccountType = async (type: any) => {
  const userConfig = new AccountUserConfig();
  await userConfig.setAccountType(type);
  return true;
};

const setRcToken = async (token: ITokenModel) => {
  if (!token.timestamp) {
    token.timestamp = Date.now();
  }
  const authConfig = new AuthUserConfig();
  await authConfig.setRcToken(token);
  return true;
};

const setRcAccountType = async () => {
  return await setAccountType(ACCOUNT_TYPE_ENUM.RC);
};

const setGlipToken = async (token: string) => {
  const authConfig = new AuthUserConfig();
  await authConfig.setGlipToken(token);
  return true;
};

const setGlipAccountType = async () => {
  return await setAccountType(ACCOUNT_TYPE_ENUM.GLIP);
};

export { setRcToken, setRcAccountType, setGlipToken, setGlipAccountType };
