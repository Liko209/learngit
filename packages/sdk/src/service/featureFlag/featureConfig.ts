import { FeatureConfig, BETA_FEATURE } from './utils';

const featureConfig: FeatureConfig = {
  [BETA_FEATURE.LOG]: ['beta_enable_log'],
  [BETA_FEATURE.SMS]: ['SMS_beta']
};

export default featureConfig;
