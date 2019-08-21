/*
 * @Author: Paynter Chen
 * @Date: 2019-04-08 14:20:58
 * Copyright © RingCentral. All rights reserved.
 */
import { defaultConfig } from './defaultConfig';
import { DeepPartial, ApiConfig } from '../types';
import _ from 'lodash';

class ApiConfiguration {
  private static _apiConfig: ApiConfig = defaultConfig;

  static get apiConfig() {
    return ApiConfiguration._apiConfig;
  }

  static setApiConfig(config: DeepPartial<ApiConfig>) {
    ApiConfiguration._apiConfig = _.merge({}, defaultConfig, config);
  }
}

export { ApiConfiguration };
