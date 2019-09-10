import { ApiConfig, DeepPartial } from 'sdk/types';

const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://platform.ringcentral.com',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://app.glip.com',
    apiServer: 'https://api.glip.com',
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
  sumologic: {
    server: 'https://collectors.sumologic.com/receiver/v1/http/',
    uniqueHttpCollectorCode:
      'ZaVnC4dhaV3dzvBaY1wZqHcCh6D_2Ai3S-v_j39KpeGfbifz6Ir-C_hqAy0SaJROQ8A6tBsgSOKrmgynKRSZW9CCGvcqfYV1crTV9x0NDS6bYSZIC7Z4jw==',
  },
  meetingsConfig: {
    rcv: { baseUrl: 'https://v.ringcentral.com', dialInNumber: '+16504191505' },
  },
  data_collection: 'https://jupedc.ringcentral.com',
  segment: "caLH3xAG2alfJm6DdJbTzrBmDeJRXNzO",
};
export default config;
