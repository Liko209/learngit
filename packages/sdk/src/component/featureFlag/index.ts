import FeatureFlag from './FeatureFlag';
import ConfigChangeNotifier from './configChangeNotifier';
import featureConfig from './featureConfig';
import FlagCalculator from './FlagCalculator';
import AccountDao from '../../dao/account';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../dao/account/constants';
import { daoManager } from '../../dao';

const dao: AccountDao = daoManager.getKVDao(AccountDao);
const companyId: number = dao.get(ACCOUNT_COMPANY_ID);
const userId: number = dao.get(ACCOUNT_USER_ID);
const accountInfo = { companyId, userId };
const notifier = new ConfigChangeNotifier();
const calculator = new FlagCalculator(featureConfig, accountInfo);
const featureFlag = new FeatureFlag(notifier, calculator);
export default featureFlag;
