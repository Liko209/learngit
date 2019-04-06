/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-07 17:06:56
 * Copyright © RingCentral. All rights reserved.
 */

type BaseConfig = {
  server?: string;
  cacheServer?: string;
  pathPrefix?: string;
};

type RcConfig = BaseConfig & {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

type GlipConfig = BaseConfig & {
  apiServer: string;
};

type DeskTopConfig = BaseConfig & {};

type UploadConfig = BaseConfig;

type SplitIOConfig = BaseConfig & {
  clientSecret: string;
};

type LaunchDarklyConfig = {
  clientId: string;
};

type SumologicConfig = {
  server: string;
  uniqueHttpCollectorCode: string;
};

type ApiConfig = {
  rc: RcConfig;
  glip: GlipConfig;
  glip_desktop: DeskTopConfig;
  upload: UploadConfig;
  splitio: SplitIOConfig;
  launchdarkly: LaunchDarklyConfig;
  sumologic: SumologicConfig;
};

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
type PartialApiConfig = DeepPartial<ApiConfig>;

type HttpConfigType = 'glip' | 'rc' | 'upload' | 'glip_desktop';

export {
  BaseConfig,
  RcConfig,
  GlipConfig,
  SplitIOConfig,
  UploadConfig,
  ApiConfig,
  PartialApiConfig,
  HttpConfigType,
  DeepPartial,
};
