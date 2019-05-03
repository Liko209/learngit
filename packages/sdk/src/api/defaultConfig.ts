import { ApiConfig } from '../types';

const defaultConfig: ApiConfig = {
  rc: {
    server: '',
    clientId: '',
    redirectUri: '',
  },
  glip: {
    server: '',
    apiServer: '',
    presenceServer: '',
  },
  glip_desktop: {},
  upload: {
    server: '',
  },
  splitio: {
    clientSecret: '',
  },
  launchdarkly: {
    clientId: '',
  },
  sumologic: {
    server: '',
    uniqueHttpCollectorCode: '',
  },
};

export { defaultConfig };
