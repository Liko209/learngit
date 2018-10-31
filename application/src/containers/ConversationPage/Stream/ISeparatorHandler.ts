/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:25:27
 * Copyright © RingCentral. All rights reserved.
 */
import { IPostHandler } from './IPostHandler';
import { Separator } from './types';

interface ISeparatorHandler extends IPostHandler {
  /*
   * When separator is at the same position, the separator that
   * has higher priority would override lower priority one.
   */
  priority: number;
  /*
   * Separators are here
   */
  separatorMap: Map<number, Separator>;
}

export { ISeparatorHandler };
