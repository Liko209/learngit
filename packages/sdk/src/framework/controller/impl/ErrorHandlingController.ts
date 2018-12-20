import { IErrorHandlingController } from '../interface/IErrorHandlingController';

/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

class ErrorHandlingController implements IErrorHandlingController {
  throwUndefinedError(key: string): never {
    throw new Error(`${key} is undefined!`);
  }

  throwInvalidParameterError(key: string, value: any): never {
    throw new Error(`${key} is invalid! it is ${value}`);
  }
}

export { ErrorHandlingController };
