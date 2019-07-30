/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:22:18
 * Copyright © RingCentral. All rights reserved.
 */
import { IApiContract, IRoute } from '../types';
import { META_ROUTE } from './constants';

export const Route = <T extends IApiContract>(
  desc: IRoute<T>,
): MethodDecorator => (target, propertyKey, descriptor) => {
  Reflect.defineMetadata(META_ROUTE, desc, target, propertyKey);
  return descriptor;
};
