import { ComponentType } from 'react';
import { IViewModel } from '@/base/IViewModel';
import { AbstractPlugin } from '@/base/AbstractPlugin';
import { createFunctionDecorator } from '../utils';
import { ErrorHandlerFactory } from './ErrorHandlerFactory';
interface IErrorHandlerViewModel extends IViewModel {}

const errorHandlerFactory = new ErrorHandlerFactory();

class ErrorHandlerPlugin extends AbstractPlugin {
  afterInstall(): void {
    // TODO Will need to extend vm while using a WrappedView
    // this.extendViewModel({});
  }

  wrapView(View: ComponentType<any>) {
    // TODO use custom alert dialog
    return View;
  }

  uninstall() {
    // TODO handle uninstall
    console.log(this.vm);
  }
}

const handleError = createFunctionDecorator({
  install(
    vm: IErrorHandlerViewModel,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalFn = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        await originalFn.apply(this, args);
      } catch (err) {
        const handler = errorHandlerFactory.build(err.handler);
        if (!handler) throw err;
        handler.handle(err, vm);
      }
    };
    return descriptor;
  },
});

export { ErrorHandlerPlugin, IErrorHandlerViewModel, handleError };
