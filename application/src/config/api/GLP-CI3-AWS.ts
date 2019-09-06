/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-09-05 13:07:06
 * Copyright © RingCentral. All rights reserved.
 */
import { ApiConfig, DeepPartial } from 'sdk/types';

const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://platform-glpapiams.lab.nordigy.ru',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://glpci3aws.dev.glip.net',
    apiServer: 'https://glpci3aws.dev.glip.net',
    cacheServer: 'https://cache-glpci3aws.dev.glip.net:31337',
    presenceServer: 'https://api-glpci3aws.dev.glip.net',
  },
  glip_desktop: {
    server: 'https://glpci3aws.dev.glip.net',
    pathPrefix: '/v1.0/desktop',
  },
  upload: {
    server: 'https://api-glpci3aws.dev.glip.net/upload',
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
