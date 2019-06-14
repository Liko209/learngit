import {
  Container,
  ContainerModule,
  decorate,
  inject,
  injectable,
  interfaces,
  METADATA_KEY,
} from 'inversify';
import {
  provide,
  fluentProvide,
  buildProviderModule,
  autoProvide,
} from 'inversify-binding-decorators';
import getDecorators from 'inversify-inject-decorators';
import { IS_DECORATOR } from './constants';

const container = new Container({
  defaultScope: 'Singleton',
  skipBaseClassChecks: true,
});

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

function createDecorator(serviceId: string): { (...args: any[]): void } {
  const id: any = inject(serviceId);
  id.toString = () => serviceId;
  id[IS_DECORATOR] = true;
  return id;
}

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
  METADATA_KEY,
  lazyInject,
  lazyInjectNamed,
  lazyInjectTagged,
  lazyMultiInject,
  createDecorator,
};
