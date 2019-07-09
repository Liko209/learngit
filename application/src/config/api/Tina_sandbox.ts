import { ApiConfig, DeepPartial } from 'sdk/types';

const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://api-xmnup.lab.nordigy.ru',
    clientId: 'YCWFuqW8T7-GtSTb6KBS6g',
  },
  glip: {
    server: 'https://aws13-g04-uds01.asialab.glip.net:33604',
    apiServer: 'https://aws13-g04-uds01.asialab.glip.net:33604',
    cacheServer: 'https://aws13-g04-uds01.asialab.glip.net:33607',
    presenceServer: 'https://aws13-g04-uds01.asialab.glip.net:33604',
  },
  glip_desktop: {
    server: 'https://aws13-g04-uds01.asialab.glip.net:33604',
    pathPrefix: 'v1.0/desktop',
  },
  upload: {
    server: 'https://aws13-g04-uds01.asialab.glip.net:33606/upload',
  },
};
export default config;
