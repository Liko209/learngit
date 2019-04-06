import { ApiConfig, DeepPartial } from 'sdk/types';
const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://xmn02-i01-mck02.lab.nordigy.ru/jupiter/rc',
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
  upload: {
    server: 'https://xmn02-i01-mck02.lab.nordigy.ru/jupiter/upload',
  },
};
export default config;
