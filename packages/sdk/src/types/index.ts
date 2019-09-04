import { ApiConfig } from './api';
import { DBConfig } from './db';

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

type Nullable<T> = T | null;
type UndefinedAble<T> = T | undefined;

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K
}[keyof T] &
  string;
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T] &
  string;

interface INewable<T> {
  new (...args: any[]): T;
}

interface ISdkConfig {
  api?: DeepPartial<ApiConfig>;
  db?: DeepPartial<DBConfig>;
}

type LoginInfo = {
  success: boolean,
  isFirstLogin?: boolean,
}

export {
  INewable,
  ISdkConfig,
  DeepPartial,
  Nullable,
  UndefinedAble,
  NonFunctionPropertyNames,
  FunctionPropertyNames,
  LoginInfo,
};
export * from './api';
export * from './db';
export * from './pagination';
