import { ApiConfig } from '../types';

const defaultConfig: ApiConfig = {
  rc: {
    server: '',
    apiPlatform: '',
    apiPlatformVersion: '',
    clientId: '',
    clientSecret: '',
    redirectUri: '',
  },
  glip: {
    server: '',
    apiPlatform: '',
  },
  glip2: {
    server: '',
    apiPlatform: '',
    apiPlatformVersion: '',
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    brandId: 0,
  },
  upload: {
    server: '',
    apiPlatform: '',
  },
};

export { defaultConfig };
