/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-09-05 13:09:16
 * Copyright © RingCentral. All rights reserved.
 */
import { ApiConfig, DeepPartial } from 'sdk/types';

const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://platform-glpapiams.lab.nordigy.ru',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://glpsupaws.dev.glip.net',
    apiServer: 'https://glpsupaws.dev.glip.net',
    cacheServer: 'https://cache-glpsupaws.dev.glip.net',
    presenceServer: 'https://api-glpsupaws.dev.glip.net',
  },
  glip_desktop: {
    server: 'https://glpsupaws.dev.glip.net',
    pathPrefix: '/v1.0/desktop',
  },
  upload: {
    server: 'https://api-glpsupaws.dev.glip.net/upload',
  },
  meetingsConfig: {
    rcv: {
      baseUrl: 'https://glpapiams-shr-1-v.lab.nordigy.ru',
      dialInNumber: '+18582073116',
    },
  },
  data_collection: '',
};

export default config;
