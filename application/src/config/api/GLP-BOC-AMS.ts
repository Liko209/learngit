import { ApiConfig, DeepPartial } from 'sdk/types';
const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://api-glpbocams.lab.nordigy.ru',
    clientId: 'MkCdlSVqQ06H6i7KYcv9bg',
    clientSecret: '5_tFBXBQTLWaVcPF61LUGgngBfc8KGQCaZ0_UTw80vsw',
  },
  glip2: {
    server: 'https://api-glpbocams.lab.nordigy.ru',
    clientId: 'MkCdlSVqQ06H6i7KYcv9bg',
    clientSecret: '5_tFBXBQTLWaVcPF61LUGgngBfc8KGQCaZ0_UTw80vsw',
    redirectUri: 'http://localhost:3000/unified-login/',
  },
  glip: {
    server: 'https://app.glipdemo.com',
    apiServer: 'https://app.glipdemo.com:8443',
    pathPrefix: '/api',
  },
  glip_desktop: {
    server: 'https://app.glipdemo.com',
    pathPrefix: 'v1.0/desktop',
  },
  upload: {
    server: 'https://api.glipdemo.com',
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
