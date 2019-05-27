/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 16:52:42
 * Copyright © RingCentral. All rights reserved.
 */

import { SubModuleConfig } from '../types';
import * as setting from '@/modules/setting2/module.config';

const config: SubModuleConfig = {
  moduleConfig: setting.config,
  // loader: () =>
  //   import(/*
  // webpackChunkName: "m.setting" */ '@/modules/setting'),
};

export { config };
