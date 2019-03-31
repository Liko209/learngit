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
  },
  glip2: {
    server: '',
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    brandId: 0,
  },
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
