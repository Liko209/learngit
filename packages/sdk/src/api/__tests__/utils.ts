import { RcConfig, GlipConfig, Glip2Config, UploadConfig } from '../../types';

const rc: RcConfig = {
  clientId: '',
  clientSecret: '',
  redirectUri: '/',
};

const glip: GlipConfig = {};

const glip2: Glip2Config = {
  clientId: '1',
  clientSecret: '',
  redirectUri: '/',
  brandId: 0,
};

const upload: UploadConfig = {};

const apiConfig = { rc, glip, glip2, upload };

export { apiConfig };
