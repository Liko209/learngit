/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ItContext } from 'shield/sdk';
import { IGlipPostPost } from 'shield/sdk/mocks/glip/api/post/post.post.contract';
import { GlipInitialDataHelper } from 'shield/sdk/mocks/glip/data/data';
import { GlipGroup } from 'shield/sdk/mocks/glip/types';
import { GlipScenario } from 'shield/sdk/mocks/glip/GlipScenario';

export class Fail extends GlipScenario {
  team: GlipGroup;
  constructor(
    protected context: ItContext,
    protected glipIndexDataHelper: GlipInitialDataHelper,
    public props: { teamName?: string; uids?: number[] },
  ) {
    super(context, glipIndexDataHelper, props);
    const { teamName = 'Test Team with thomas', uids = [123] } = props || {};
    const { helper } = context;
    const team = (this.team = helper
      .glipDataHelper()
      .team.createTeam(teamName, uids));
    glipIndexDataHelper.teams.insertOrUpdate(team);
    helper.mockApi(IGlipPostPost, {
      status: 400,
      statusText: 'mock send post fail.',
    });
  }
}
