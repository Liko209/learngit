import { IFeatureConfig, BETA_FEATURE } from './interface';

const featureConfig: IFeatureConfig = {
  [BETA_FEATURE.LOG]: ['beta_enable_log'],
  [BETA_FEATURE.SMS]: ['SMS_beta'],
};

export default featureConfig;
