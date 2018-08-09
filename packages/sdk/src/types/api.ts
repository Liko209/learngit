/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-07 17:06:56
 * Copyright © RingCentral. All rights reserved.
 */

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

type HttpConfigType = "glip" | "glip2" | "rc" | "upload" | "glip_desktop";

export {
  BaseConfig, RcConfig, Glip2Config, GlipConfig,
  UploadConfig, ApiConfig, PartialApiConfig, HttpConfigType,
};
