/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-09-05 13:09:16
 * Copyright © RingCentral. All rights reserved.
 */
import { ApiConfig, DeepPartial } from 'sdk/types';

const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://platform-glpwatams.lab.nordigy.ru',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://glpwatams.dev.glip.net',
    apiServer: 'https://glpwatams.dev.glip.net:8443',
    cacheServer: 'https://cache-glpwatams.dev.glip.net:31337',
    presenceServer: 'https://api-glpwatams.dev.glip.net',
  },
  glip_desktop: {
    server: 'https://glpwatams.dev.glip.net',
    pathPrefix: '/v1.0/desktop',
  },
  upload: {
    server: 'https://api-glpwatams.dev.glip.net',
  },
  data_collection: '',
};

export default config;
