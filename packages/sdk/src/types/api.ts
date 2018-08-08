type BaseConfig = {
  server?: string;
  apiPlatform: string;
  apiPlatformVersion?: string;
};

type RcConfig = BaseConfig & {
  clientId: string;
  redirectUri: string;
  clientSecret: string;
};

type Glip2Config = BaseConfig & {
  clientId: string;
  redirectUri: string;
  clientSecret: string;
  brandId: number;
};

type GlipConfig = BaseConfig;

type UploadConfig = BaseConfig;

type ApiConfig = {
  rc: RcConfig;
  glip: GlipConfig;
  glip2: Glip2Config;
  upload: UploadConfig;
};

type PartialApiConfig = {
  rc?: Partial<RcConfig>;
  glip?: Partial<GlipConfig>;
  glip2?: Partial<Glip2Config>;
  upload?: Partial<UploadConfig>;
};

type HttpConfigType = 'glip' | 'glip2' | 'rc' | 'upload';

export {
  BaseConfig, RcConfig, Glip2Config, GlipConfig,
  UploadConfig, ApiConfig, PartialApiConfig, HttpConfigType,
};
