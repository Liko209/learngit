/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { readApiJson, ItContext, get } from 'shield/sdk';
import { GlipInitialDataHelper } from 'shield/sdk/mocks/glip/data/data';
import { GlipGroup } from 'shield/sdk/mocks/glip/types';
import { GlipScenario } from 'shield/sdk/mocks/glip/GlipScenario';
import { UpdateSpec, update } from 'foundation/utils/update';
import { IGlipTeamPost } from 'shield/sdk/mocks/glip/api/team/team.post.contract';

export class CreateSuccess extends GlipScenario {
  createdTeam: GlipGroup;
  constructor(
    protected context: ItContext,
    protected glipIndexDataHelper: GlipInitialDataHelper,
    public props: {
      teamInfo?: UpdateSpec<GlipGroup>;
    },
  ) {
    super(context, glipIndexDataHelper, props);
    const { helper } = context;

    const templateJson = readApiJson<IGlipTeamPost>(
      require('../data/CREATE_TEAM.SUCCESS.json'),
    );
    const modifiedJson = update(templateJson, {
      response: {
        data: get(props, v => v.teamInfo),
      },
    });
    this.createdTeam = helper.mockResponse(
      modifiedJson,
      api => api.response.data,
    );
  }
}
