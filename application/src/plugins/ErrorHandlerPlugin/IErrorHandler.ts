/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:23
 * Copyright © RingCentral. All rights reserved.
 */
import { IViewModel } from '@/base';
import { UIError } from './UIError';

interface IErrorHandler {
  handle(err: UIError, vm: IViewModel): void;
}

export { IErrorHandler };
