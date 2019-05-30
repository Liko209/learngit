import { ACCOUNT_TYPE_ENUM } from './constants';
import { ITokenModel } from '../api';
import { AccountService } from '../module/account/service';
import { ServiceLoader, ServiceConfig } from '../module/serviceLoader';

const setAccountType = async (type: any) => {
  const userConfig = ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  ).userConfig;
  await userConfig.setAccountType(type);
  return true;
};

const setRCToken = async (token: ITokenModel) => {
  if (!token.timestamp) {
    token.timestamp = Date.now();
  }
  const authConfig = ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  ).authUserConfig;
  await authConfig.setRCToken(token);
  return true;
};

const setRCAccountType = async () => {
  return await setAccountType(ACCOUNT_TYPE_ENUM.RC);
};

const setGlipToken = async (token: string) => {
  const authConfig = ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  ).authUserConfig;
  await authConfig.setGlipToken(token);
  return true;
};

const setGlipAccountType = async () => {
  return await setAccountType(ACCOUNT_TYPE_ENUM.GLIP);
};

export { setRCToken, setRCAccountType, setGlipToken, setGlipAccountType };
