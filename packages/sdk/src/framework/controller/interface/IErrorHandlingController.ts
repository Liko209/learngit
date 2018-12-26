/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

interface IErrorHandlingController {
  throwUndefinedError(key: string): never;

  throwInvalidParameterError(key: string, value: any): never;
}

export { IErrorHandlingController };
