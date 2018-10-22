import { PartialApiConfig } from './api';
import { DBConfig } from './db';

interface INewable<T> {
  new (...args: any[]): T;
}

interface ISdkConfig {
  api?: PartialApiConfig;
  db?: Partial<DBConfig>;
}

export { INewable, ISdkConfig };
export * from './api';
export * from './db';
export * from './pagination';
