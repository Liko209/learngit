/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ItContext, readJson } from 'shield/sdk';
import { IGlipPostPost } from 'shield/sdk/mocks/server/glip/api/post/post.post.contract';
import { GlipInitialDataHelper } from 'shield/sdk/mocks/server/glip/data/data';
import { createResponse } from 'shield/sdk/mocks/server/utils';

export function sendPostFailScenarioFactory(
  context: ItContext,
  glipIndexDataHelper: GlipInitialDataHelper,
) {
  const { helper } = context;
  const team = helper
    .glipDataHelper()
    .team.createTeam('Test Team with thomas', [123], {
      post_cursor: 0,
    });
  glipIndexDataHelper.teams.insertOrUpdate(team);
  helper.mockApi(IGlipPostPost, {
    status: 400,
    statusText: 'mock send post fail.',
  });
  return {
    team,
  };
}
