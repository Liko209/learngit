/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ItContext } from './types';

export class BaseScenario<Props extends object> {
  constructor(protected context: ItContext, public props: Props) {}
}
