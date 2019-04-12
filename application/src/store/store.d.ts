import { ENTITY_NAME, HANDLER_TYPE } from './constants';
import { EVENT_TYPES } from 'sdk/service';
import { IdModel } from 'sdk/framework/model';

export type Entity = {
  id: number;
  isMocked: boolean;
  data?: any;
  [name: string]: any;
};

export type EntitySetting<K extends Entity> = {
  event: string[];
  service: Function | [Function, string];
  type: HANDLER_TYPE;
  cacheCount: number;
  modelCreator?: (model: IdModel) => K;
};
