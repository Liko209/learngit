/*
 * @Author: Paynter Chen
 * @Date: 2019-04-06 14:14:33
 * Copyright © RingCentral. All rights reserved.
 */

import { RawConfig } from './types';
function parseConfigMap(): RawConfig {
  const requireContext = require.context(
    './',
    true,
    /^(?!\.\/(index|Config|types|utils|requireUtil|__tests__)).*\.ts$/,
  );
  const keys = requireContext.keys();
  const rawConfig = {} as RawConfig;
  return keys.reduce((config, envPath) => {
    const [, keyName, envFileName] = envPath.split('/');
    const [envName] = envFileName.split('.');
    config[keyName] = config[keyName] || {};
    config[keyName][envName] = requireContext(envPath)['default'];
    return config;
  },                 rawConfig);
}
export { parseConfigMap };
