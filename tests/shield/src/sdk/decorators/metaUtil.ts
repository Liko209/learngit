/*
 * @Author: Paynter Chen
 * @Date: 2019-07-05 09:43:29
 * Copyright © RingCentral. All rights reserved.
 */
import 'reflect-metadata';
import { UndefinedAble } from 'jui/components/VirtualizedList';

export const getPrototypeDefineFunctions = (prototype: any): string[] => {
  if (prototype === Object.prototype) return [];
  const superPrototype = Reflect.getPrototypeOf(prototype);
  return [
    ...getPrototypeDefineFunctions(superPrototype),
    ...Object.getOwnPropertyNames(prototype).filter(key => {
      return (
        key !== 'constructor' &&
        Object.prototype.toString.call(prototype[key] === '[object Function]')
      );
    }),
  ];
};

export const getMeta = <META>(
  prototype: any,
  metaKey: string,
  functionKeys?: string[],
): ({ key: string; meta: META })[] => {
  return (functionKeys || getPrototypeDefineFunctions(prototype))
    .map(key => {
      return {
        key,
        meta: Reflect.getMetadata(metaKey, prototype, key),
      };
    })
    .filter(result => !!result.meta);
};

export const createParameterDecorator = (
  metaKey: string,
  ...params: any
): ParameterDecorator => {
  return (target, propertyKey, index) => {
    Reflect.defineMetadata(
      metaKey,
      {
        index,
        params,
      },
      target,
      propertyKey,
    );
  };
};

export const getParamMeta = <T>(
  prototype: any,
  metaKey: string,
  propertyKey: string,
): UndefinedAble<{ index: number; params: T }> => {
  return Reflect.getMetadata(metaKey, prototype, propertyKey);
};
