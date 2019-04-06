import { ApiConfig, DeepPartial } from 'sdk/types';
const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://api-glpci1xmn.lab.nordigy.ru',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
    clientSecret: 'vRR_7-8uQgWpruNZNLEaKgcsoaFaxnS-uZh9uWu2zlsA',
  },
  glip: {
    server: 'https://glpci1xmn.asialab.glip.net',
    apiServer: 'https://glpci1xmn.asialab.glip.net:8443',
    cacheServer: 'https://glpci1xmn.asialab.glip.net:31337',
  },
  glip_desktop: {
    server: 'https://glpci1xmn.asialab.glip.net',
    pathPrefix: '/v1.0/desktop',
  },
  upload: {
    server: 'https://glpci1xmn.asialab.glip.net:8443',
  },
};
export default config;
