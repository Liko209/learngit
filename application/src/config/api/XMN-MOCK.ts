import { ApiConfig } from 'sdk/types';
const config: ApiConfig = {
  rc: {
    server: 'https://xmn02-i01-mck02.lab.nordigy.ru/jupiter/rc',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
    clientSecret: 'vRR_7-8uQgWpruNZNLEaKgcsoaFaxnS-uZh9uWu2zlsA',
  },
  glip2: {
    server: 'https://xmn02-i01-mck02.lab.nordigy.ru/jupiter/glip2',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
    clientSecret: 'vRR_7-8uQgWpruNZNLEaKgcsoaFaxnS-uZh9uWu2zlsA',
  },
  glip: {
    server: 'https://xmn02-i01-mck02.lab.nordigy.ru/jupiter/glip',
    apiServer: 'https://xmn02-i01-mck02.lab.nordigy.ru:8443/jupiter/glip',
    cacheServer: 'https://xmn02-i01-mck02.lab.nordigy.ru/jupiter/glip_cache',
  },
  glip_desktop: {
    server: 'https://xmn02-i01-mck02.lab.nordigy.ru/jupiter/glip_desktop',
    pathPrefix: '/v1.0/desktop',
  },
  splitio: {
    clientSecret: '2rvs5gfmofo7giss2t6u1ebvi0dirt5ooqmt',
  },
  launchdarkly: {
    clientId: '5c6a4261eb049c2df965e0a7',
  },
  upload: {
    server: 'https://xmn02-i01-mck02.lab.nordigy.ru/jupiter/upload',
  },
  sumologic: {
    server: 'https://endpoint1.collection.us2.sumologic.com/receiver/v1/http/',
    uniqueHttpCollectorCode:
      'ZaVnC4dhaV28t7AbUj9Cd_JP7Cb44le-OLPq1-sjIkhGgL155gqi8P3etfNtjzOLtijRtTufVhjoqOMZFNCSDEnTAcEAN36bfF41Jmf7_nssAS-z8jTnjg==',
  },
};
export default config;
