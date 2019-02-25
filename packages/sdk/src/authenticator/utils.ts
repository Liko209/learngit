import { ACCOUNT_TYPE_ENUM } from './constants';
import { ITokenModel } from '../api';
import { AuthGlobalConfig } from '../service/auth/config';
import { NewGlobalConfig } from '../service/config';

const setAccountType = async (type: any) => {
  await NewGlobalConfig.getInstance().setAccountType(type);
  return true;
};

const setRcToken = async (token: ITokenModel) => {
  if (!token.timestamp) {
    token.timestamp = Date.now();
  }
  await AuthGlobalConfig.setRcToken(token);
  return true;
};

const setRcAccountType = async () => {
  return await setAccountType(ACCOUNT_TYPE_ENUM.RC);
};

const setGlipToken = async (token: string) => {
  await AuthGlobalConfig.setGlipToken(token);
  return true;
};

const setGlipAccountType = async () => {
  return await setAccountType(ACCOUNT_TYPE_ENUM.GLIP);
};

export { setRcToken, setRcAccountType, setGlipToken, setGlipAccountType };
