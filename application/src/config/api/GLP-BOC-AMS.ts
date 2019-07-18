import { ApiConfig, DeepPartial } from 'sdk/types';

const config: DeepPartial<ApiConfig> = {
  rc: {
    server: 'https://api-glpbocams.lab.nordigy.ru',
    clientId: 'MkCdlSVqQ06H6i7KYcv9bg',
  },
  glip: {
    server: 'https://app.glipdemo.com',
    apiServer: 'https://app.glipdemo.com:8443',
    pathPrefix: '/api',
    presenceServer: 'https://api.glipdemo.com',
  },
  glip_desktop: {
    server: 'https://app.glipdemo.com',
    pathPrefix: 'v1.0/desktop',
  },
  upload: {
    server: 'https://api.glipdemo.com',
  },
};
export default config;
