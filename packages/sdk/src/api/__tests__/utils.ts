import { RcConfig, GlipConfig, UploadConfig } from '../../types';

const rc: RcConfig = {
  clientId: '',
  redirectUri: '/',
};

const glip: GlipConfig = {
  server: '',
  cacheServer: '',
  pathPrefix: '',
  apiServer: '',
};

const upload: UploadConfig = {};

const apiConfig = { rc, glip, upload };

export { apiConfig };
