import { ApiConfig, DeepPartial } from 'sdk/types';
const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://api-glpdevxmn.lab.nordigy.ru',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://glpdevxmn.asialab.glip.net',
    apiServer: 'https://glpdevxmn.asialab.glip.net:8443',
    cacheServer: 'https://glpdevxmn.asialab.glip.net:31337',
    presenceServer: 'https://glpdevxmn.asialab.glip.net:8443',
  },
  glip_desktop: {
    server: 'https://glpdevxmn.asialab.glip.net',
    pathPrefix: '/v1.0/desktop',
  },
  upload: {
    server: 'https://glpdevxmn.asialab.glip.net:8443',
  },
};
export default config;
