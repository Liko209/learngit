import { IFeatureConfig, BETA_FEATURE } from './interface';

const featureConfig: IFeatureConfig = {
  [BETA_FEATURE.LOG]: ['beta_enable_log_emails', 'beta_enable_log_domains'],
  [BETA_FEATURE.SMS]: ['SMS_beta'],
};

export default featureConfig;
