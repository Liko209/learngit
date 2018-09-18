/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import { ERROR_HANDLER } from './constants';

type UIErrorOptions = {
  message: string;
  handler: ERROR_HANDLER;
};

class UIError extends Error {
  handler: ERROR_HANDLER;

  constructor(options: UIErrorOptions) {
    super(options.message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UIError.prototype);
    this.handler = options.handler;
  }
}
export { UIError };
