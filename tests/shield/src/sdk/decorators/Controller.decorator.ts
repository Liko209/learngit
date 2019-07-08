import { META_CONTROLLER } from './constants';

export const Controller = <T extends IApi>(
  desc: IRoute<T>,
): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(META_ROUTE, desc, target, propertyKey);
    return descriptor;
  };
};
