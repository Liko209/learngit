/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:25
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { IViewModel } from '@/base/IViewModel';
import { IPlugin } from '@/base/IPlugin';
import { createFunctionDecorator } from '../utils';
import { ErrorHandlerFactory } from './ErrorHandlerFactory';
interface IErrorHandlerViewModel extends IViewModel {}

const errorHandlerFactory = new ErrorHandlerFactory();

class ErrorHandlerPlugin implements IPlugin {
  install(): void {
    // TODO Will need to extend vm while using a WrappedView
    // this.extendViewModel({});
  }

  wrapView(View: ComponentType<any>) {
    // TODO use custom alert dialog
    return View;
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
