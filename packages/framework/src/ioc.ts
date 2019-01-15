import {
  Container,
  ContainerModule,
  decorate,
  inject,
  injectable,
  interfaces,
} from 'inversify';
import {
  provide,
  fluentProvide,
  buildProviderModule,
  autoProvide,
} from 'inversify-binding-decorators';
import getDecorators from 'inversify-inject-decorators';

const container = new Container({ defaultScope: 'Singleton' });
const {
  lazyInject,
  lazyInjectNamed,
  lazyInjectTagged,
  lazyMultiInject,
} = getDecorators(container, false);

const provideSingleton = (identifier: interfaces.ServiceIdentifier<any>) => {
  return fluentProvide(identifier)
    .inSingletonScope()
    .done();
};

export {
  interfaces,
  Container,
  ContainerModule,
  container,
  injectable,
  decorate,
  provide,
  provideSingleton,
  buildProviderModule,
  autoProvide,
  inject,
  lazyInject,
  lazyInjectNamed,
  lazyInjectTagged,
  lazyMultiInject,
};
