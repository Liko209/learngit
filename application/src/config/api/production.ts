import { ApiConfig, DeepPartial } from 'sdk/types';
const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://platform.ringcentral.com',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://app.glip.com',
    apiServer: 'https://app.glip.com',
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
    clientId: '5c6a4261eb049c2df965e0a8',
  },
  splitio: {
    clientSecret: 'fo81g08vhro235qg0c6chlh45vo7ejang4bs',
  },
};
export default config;
