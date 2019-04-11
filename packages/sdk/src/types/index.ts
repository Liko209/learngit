import { ApiConfig } from './api';
import { DBConfig } from './db';

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

interface INewable<T> {
  new (...args: any[]): T;
}

interface ISdkConfig {
  api?: DeepPartial<ApiConfig>;
  db?: DeepPartial<DBConfig>;
}

export { INewable, ISdkConfig, DeepPartial };
export * from './api';
export * from './db';
export * from './pagination';
