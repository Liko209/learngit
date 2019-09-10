import { ApiConfig, DeepPartial } from 'sdk/types';

const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://api-glpci1xmn.lab.nordigy.ru',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://glpci1xmn.asialab.glip.net',
    apiServer: 'https://glpci1xmn.asialab.glip.net:8443',
    cacheServer: 'https://glpci1xmn.asialab.glip.net:31337',
    presenceServer: 'https://glpci1xmn.asialab.glip.net:8443',
  },
  glip_desktop: {
    server: 'https://glpci1xmn.asialab.glip.net',
    pathPrefix: '/v1.0/desktop',
  },
  upload: {
    server: 'https://glpci1xmn.asialab.glip.net:8443',
  },
  launchdarkly: {
    clientId: '',
  },
  splitio: {
    clientSecret: '',
  },
  data_collection: '',
  segment: '',
};
export default config;
