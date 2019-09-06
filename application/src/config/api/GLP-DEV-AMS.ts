/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-09-05 13:07:06
 * Copyright © RingCentral. All rights reserved.
 */
import { ApiConfig, DeepPartial } from 'sdk/types';

const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'http://platform-glpdevams.lab.nordigy.ru:8180',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://glpdevams.dev.glip.net',
    apiServer: 'https://glpdevams.dev.glip.net',
    cacheServer: 'https://cache-glpdevams.dev.glip.net:31337',
    presenceServer: 'https://api-glpdevams.dev.glip.net',
  },
  glip_desktop: {
    server: 'https://glpdevams.dev.glip.net',
    pathPrefix: '/v1.0/desktop',
  },
  upload: {
    server: 'https://api-glpdevams.dev.glip.net/upload',
  },
  meetingsConfig: {
    rcv: {
      baseUrl: 'https://glpdevams-shr-1-v.lab.nordigy.ru',
      dialInNumber: '+18582073116',
    },
  },
  data_collection: '',
};

export default config;
