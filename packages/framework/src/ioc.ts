import {
  Container,
  ContainerModule,
  decorate,
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

const provideSingleton = (identifier: interfaces.ServiceIdentifier<any>) =>
  fluentProvide(identifier)
    .inSingletonScope()
    .done();

type DecoratorFunction = (...args: any[]) => void;

type Decorator = DecoratorFunction & {
  multi: DecoratorFunction;
  named: (named: string) => DecoratorFunction;
  tagged: (key: string, value: any) => DecoratorFunction;
};

function createDecorator(serviceId: string): Decorator {
  const decorator: any = lazyInject(serviceId);
  decorator.multi = lazyMultiInject(serviceId);
  decorator.named = (named: string) => lazyInjectNamed(serviceId, named);
  decorator.tagged = (key: string, value: any) =>
    lazyInjectTagged(serviceId, key, value);
  decorator.toString = () => serviceId;
  decorator[IS_DECORATOR] = true;
  return decorator;
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
  lazyInject,
  lazyInject as inject,
  METADATA_KEY,
  lazyInjectNamed,
  lazyInjectTagged,
  lazyMultiInject,
  createDecorator,
};
