/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ItContext } from 'shield/sdk';
import { GlipInitialDataHelper } from 'shield/sdk/mocks/glip/data/data';
import { GlipGroup } from 'shield/sdk/mocks/glip/types';
import { UpdateSpec } from 'foundation/utils/update';
import { CreateEntitySuccess } from './CreateEntitySuccess.scenario';

export class CreateSuccess extends CreateEntitySuccess<GlipGroup> {
  protected templateJson = require('../data/CREATE_TEAM.SUCCESS.json');
  constructor(
    protected context: ItContext,
    protected glipIndexDataHelper: GlipInitialDataHelper,
    public props: {
      entity?: UpdateSpec<GlipGroup>;
    },
  ) {
    super(context, glipIndexDataHelper, props);
  }

  getApiJson() {
    return require('../data/CREATE_TEAM.SUCCESS.json');
  }
}
