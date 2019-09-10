import { ApiConfig } from 'sdk/types';

const config: ApiConfig = {
  rc: {
    server: 'https://platform.ringcentral.com',
    pathPrefix: '/restapi',
    clientId: 'FVKGRbLRTxGxPempqg5f9g',
    redirectUri: 'glip://rclogin',
  },
  glip: {
    server: 'https://app.glip.com',
    apiServer: 'https://app.glip.com',
    pathPrefix: '/api',
    cacheServer: 'https://cache.glip.com',
    presenceServer: 'https://api.glip.com',
  },
  glip_desktop: {
    server: 'https://app.glip.com',
    pathPrefix: '/v1.0/desktop',
  },
  upload: {
    server: 'https://api.glip.com',
  },
  launchdarkly: {
    clientId: '',
  },
  splitio: {
    clientSecret: '',
  },
  sumologic: {
    server: 'https://collectors.sumologic.com/receiver/v1/http/',
    uniqueHttpCollectorCode:
      'ZaVnC4dhaV1A4q5yB61FYa9uEO9Xj35paUEvTIyvb9UcNNdnMWZbMdC8OgM_BucGgknUL_nGS_PubsR9FIhVZd07rcAhgvJ6v7ZxoOvULJt_4HiwkCgEYw==',
  },
  data_collection: '',
  meetingsConfig: {
    rcv: { baseUrl: 'https://v.ringcentral.com', dialInNumber: '+18582073116' },
  },
  segment: '',
};
export default config;
