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

export class UpdateSuccess extends GlipScenario {
  updatedTeam: GlipGroup;
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
      require('../data/MODIFY_TEAM_NAME.SUCCESS.json'),
    );
    const modifiedJson = update(templateJson, {
      response: {
        data: get(props, v => v.teamInfo),
      },
    });
    this.updatedTeam = helper.mockResponse(
      modifiedJson,
      api => api.response.data,
    );
  }
}
