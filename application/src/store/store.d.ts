import { ENTITY_NAME, HANDLER_TYPE } from './constants';
import { EVENT_TYPES } from 'sdk/service';
import { IdModel, ModelIdType } from 'sdk/framework/model';

export type Entity<IdType extends ModelIdType = number> = {
  id: IdType;
  isMocked: boolean;
  data?: any;
  [name: string]: any;
};

export type EntitySetting<
  K extends Entity<IdType>,
  IdType extends ModelIdType = number
> = {
  event: string[];
  service: Function | [Function, string];
  type: HANDLER_TYPE;
  cacheCount: number;
  modelCreator?: (model: IdModel<IdType>) => K;
};
