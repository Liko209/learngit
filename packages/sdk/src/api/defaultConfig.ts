import { ApiConfig } from '../types';

const defaultConfig: ApiConfig = {
  rc: {
    server: 'rc',
    pathPrefix: '/restapi',
    clientId: '',
    redirectUri: '',
  },
  glip: {
    server: 'glip',
    apiServer: '',
    pathPrefix: '/api',
    presenceServer: '',
  },
  glip_desktop: {
    pathPrefix: '/v1.0/desktop',
    server: 'glip',
  },
  upload: {
    server: 'glip',
  },
  splitio: {
    clientSecret: '',
  },
  launchdarkly: {
    clientId: '',
  },
  sumologic: {
    server: 'sumologic',
    uniqueHttpCollectorCode: '',
  },
};

export { defaultConfig };
