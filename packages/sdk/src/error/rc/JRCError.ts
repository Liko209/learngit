/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-21 22:10:20
 * Copyright © RingCentral. All rights reserved.
 */

import { JError } from 'foundation/error';
import { ERROR_TYPES } from '../types';

export class JRCError extends JError {
  constructor(
    code: string,
    message: string,
    payload?: { [key: string]: string },
  ) {
    super(ERROR_TYPES.RC, code, message, payload);
  }
}
