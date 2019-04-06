/*
 * @Author: Paynter Chen
 * @Date: 2019-04-06 10:36:29
 * Copyright © RingCentral. All rights reserved.
 */

import { DBConfig, ApiConfig, DeepPartial } from 'sdk/types';

// use directory to declare config
// if want to add another new config, should add to this type
type DirectoryConfigMap = {
  api: ApiConfig;
  db: DBConfig;
};

type Directories = keyof DirectoryConfigMap;

type EnvConfig<T> = {
  // default should be complete T
  default: T;
} & {
  // env config can be deep partial of T, will merge with default
  [env: string]: DeepPartial<T>;
};

type RawConfig = { [key in Directories]: EnvConfig<DirectoryConfigMap[key]> };

export { DirectoryConfigMap, Directories, EnvConfig, RawConfig };
