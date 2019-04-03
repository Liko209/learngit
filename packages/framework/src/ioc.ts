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

const provideSingleton = (identifier: interfaces.ServiceIdentifier<any>) => {
  return fluentProvide(identifier)
    .inSingletonScope()
    .done();
};

export {
  interfaces,
  Container,
  ContainerModule,
  injectable,
  decorate,
  provide,
  provideSingleton,
  buildProviderModule,
  autoProvide,
  inject,
  METADATA_KEY,
};
