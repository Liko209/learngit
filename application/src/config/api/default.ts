import { ApiConfig } from 'sdk/types';
const config: ApiConfig = {
  rc: {
    server: 'https://platform.ringcentral.com',
    pathPrefix: '/restapi',
    clientId: 'FVKGRbLRTxGxPempqg5f9g',
    clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
    redirectUri: 'glip://rclogin',
  },
  glip2: {
    server: 'https://platform.ringcentral.com',
    pathPrefix: '/restapi',
    clientId: 'dQPxFL6KTWWnolcs74LM4Q',
    clientSecret: 'TT0X369AQ_q8-rUaT8NGzAg5KP_VrFSaGctmkvb4bNEQ',
    redirectUri: 'http://localhost:5000/unified-login/',
  },
  glip: {
    server: 'https://app.glip.com',
    apiServer: 'https://app.glip.com',
    pathPrefix: '/api',
    cacheServer: 'https://cache.glip.com',
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
    server: 'https://endpoint1.collection.us2.sumologic.com/receiver/v1/http/',
    uniqueHttpCollectorCode:
      'ZaVnC4dhaV28t7AbUj9Cd_JP7Cb44le-OLPq1-sjIkhGgL155gqi8P3etfNtjzOLtijRtTufVhjoqOMZFNCSDEnTAcEAN36bfF41Jmf7_nssAS-z8jTnjg==',
  },
};
export default config;
