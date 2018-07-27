import { RcConfig, GlipConfig, Glip2Config, UploadConfig } from '../../types';

const rc: RcConfig = {
  apiPlatform: '',
  clientId: '',
  clientSecret: '',
  redirectUri: '/'
};

const glip: GlipConfig = {
  apiPlatform: ''
};

const glip2: Glip2Config = {
  clientId: '1',
  clientSecret: '',
  redirectUri: '/',
  apiPlatform: '',
  brandId: 0
};

const upload: UploadConfig = {
  apiPlatform: '/restapi'
};

const apiConfig = { rc, glip, glip2, upload };

export { apiConfig };
