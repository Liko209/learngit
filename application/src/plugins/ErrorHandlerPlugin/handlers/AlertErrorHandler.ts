/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:36
 * Copyright © RingCentral. All rights reserved.
 */
import { UIError } from '../UIError';
import { IErrorHandler } from '../IErrorHandler';

class AlertErrorHandler implements IErrorHandler {
  handle(err: UIError) {
    alert(err.message);
  }
}

export { UIError, AlertErrorHandler };
