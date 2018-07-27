import { PartialApiConfig } from './api';
import { DBConfig } from './db';

interface Newable<T> {
  new (...args: any[]): T;
}

interface SdkConfig {
  api?: PartialApiConfig;
  db?: Partial<DBConfig>;
}

export { Newable, SdkConfig };
export * from './api';
export * from './db';
export * from './pagination';
