import { ENTITY_NAME, HANDLER_TYPE } from './constants';
import { BaseService, EVENT_TYPES } from 'sdk/service';
import { BaseModel } from 'sdk/models';
import {
  NotificationUpdateBody,
  NotificationReplaceBody,
  NotificationDeleteBody,
} from 'sdk/service/notificationCenter';

export type Entity = {
  id: number;
  data?: any;
  [name: string]: any;
};

export type IncomingData<T> = {
  type: EVENT_TYPES;
  body:
    | NotificationUpdateBody<T>
    | NotificationReplaceBody<T>
    | NotificationDeleteBody;
};

export type EntitySetting = {
  event: string[];
  service: Function | [Function, string];
  type: HANDLER_TYPE;
  cacheCount: number;
};
