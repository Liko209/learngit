import { ApiConfig } from 'sdk/types';
const config: ApiConfig = {
  rc: {
    server: 'https://platform.ringcentral.com',
    pathPrefix: '/restapi',
    clientId: 'FVKGRbLRTxGxPempqg5f9g',
    clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
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
    clientId: '5c6a4261eb049c2df965e0a7',
  },
  splitio: {
    clientSecret: '2rvs5gfmofo7giss2t6u1ebvi0dirt5ooqmt',
  },
  sumologic: {
    server: 'https://collectors.sumologic.com/receiver/v1/http/',
    uniqueHttpCollectorCode:
      'ZaVnC4dhaV3dzvBaY1wZqHcCh6D_2Ai3S-v_j39KpeGfbifz6Ir-C_hqAy0SaJROQ8A6tBsgSOKrmgynKRSZW9CCGvcqfYV1crTV9x0NDS6bYSZIC7Z4jw==',
  },
};
export default config;
