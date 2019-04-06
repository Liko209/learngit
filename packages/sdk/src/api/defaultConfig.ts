import { ApiConfig } from '../types';

const defaultConfig: ApiConfig = {
  rc: {
    server: '',
    clientId: '',
    clientSecret: '',
    redirectUri: '',
  },
  glip: {
    server: '',
    apiServer: '',
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
