import { IApiContract, IRoute } from '../types';
import { META_ROUTE } from './constants';

export const Route = <T extends IApiContract>(desc: IRoute<T>): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(META_ROUTE, desc, target, propertyKey);
    return descriptor;
  };
};
