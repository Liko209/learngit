import { TAB_CONFIG } from './config';
import { RIGHT_RAIL_ITEM_TYPE } from './constants';

function getTabConfig(type: RIGHT_RAIL_ITEM_TYPE) {
  const tabConfig = TAB_CONFIG.find(config => config.type === type);
  if (!tabConfig) {
    throw new Error(`getTabConfig() Error: can not find config for ${type}`);
  }
  return tabConfig;
}

export { getTabConfig };
