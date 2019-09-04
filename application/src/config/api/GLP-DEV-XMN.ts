import { ApiConfig, DeepPartial } from 'sdk/types';

const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://api-glpdevxmn.lab.nordigy.ru',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://glpdevxmn.asialab.glip.net',
    apiServer: 'https://glpdevxmn.asialab.glip.net:8443',
    cacheServer: 'https://glpdevxmn.asialab.glip.net:31337',
    presenceServer: 'https://glpdevxmn.asialab.glip.net:8443',
  },
  glip_desktop: {
    server: 'https://glpdevxmn.asialab.glip.net',
    pathPrefix: '/v1.0/desktop',
  },
  upload: {
    server: 'https://glpdevxmn.asialab.glip.net:8443',
  },
  launchdarkly: {
    clientId: '5c6a4261eb049c2df965e0a7',
  },
  splitio: {
    clientSecret: '2rvs5gfmofo7giss2t6u1ebvi0dirt5ooqmt',
  },
  data_collection: 'https://jupedc.ringcentral.com',
  segment: '5Xfm2pIidwm2h5a4OclkUw2OsnWCAlxY'
};
export default config;
