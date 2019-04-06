import { ApiConfig, DeepPartial } from 'sdk/types';
const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://api-glpdevxmn.lab.nordigy.ru',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
    clientSecret: 'vRR_7-8uQgWpruNZNLEaKgcsoaFaxnS-uZh9uWu2zlsA',
  },
  glip: {
    server: 'https://aws13-g04-uds02.asialab.glip.net:11904',
    apiServer: 'https://aws13-g04-uds02.asialab.glip.net:8443',
    cacheServer: 'https://aws13-g04-uds02.asialab.glip.net:11907',
  },
  glip_desktop: {
    server: 'https://aws13-g04-uds02.asialab.glip.net:11904',
    pathPrefix: '/v1.0/desktop',
  },
  upload: {
    server: 'https://aws13-g04-uds02.asialab.glip.net:11906',
  },
};

export default config;
