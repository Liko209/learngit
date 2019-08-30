import { ApiConfig, DeepPartial } from 'sdk/types';

const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://api-xmnup.lab.nordigy.ru',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://app-xmnup.asialab.glip.net',
    apiServer: 'https://app-xmnup.asialab.glip.net',
    cacheServer: 'https://cache-xmnup.asialab.glip.net:31337',
    presenceServer: 'https://api-xmnup.asialab.glip.net',
  },
  glip_desktop: {
    server: 'https://app-xmnup.asialab.glip.net',
    pathPrefix: 'v1.0/desktop',
  },
  upload: {
    server: 'https://api-xmnup.asialab.glip.net',
  },
  meetingsConfig: {
    rcv: {
      baseUrl: 'https://xmnup-shr-1-v.lab.nordigy.ru',
      dialInNumber: '+18582073116',
    },
  },
  data_collection: '',
};
export default config;
