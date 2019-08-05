/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ItContext } from 'shield/sdk/types';
import { GlipInitialDataHelper } from './data/data';
import { BaseScenario } from 'shield/sdk/BaseScenario';

export class GlipScenario<Props extends object = object> extends BaseScenario<Props> {
  constructor(
    protected context: ItContext,
    protected glipIndexDataHelper: GlipInitialDataHelper,
    public props: Props,
  ) {
    super(context, props);
  }
}
