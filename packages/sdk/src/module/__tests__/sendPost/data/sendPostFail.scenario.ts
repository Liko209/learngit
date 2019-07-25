/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ItContext } from 'shield/sdk';
import { IGlipPostPost } from 'shield/sdk/mocks/server/glip/api/post/post.post.contract';

export function createSendPostFailScenario(context: ItContext) {
  const { helper, template } = context;
  const glipData = helper.useInitialData(template.BASIC);
  const team = helper
    .glipDataHelper()
    .team.createTeam('Test Team with thomas', [123], {
      post_cursor: 0,
    });
  glipData.teams.push(team);
  helper.mockApi(IGlipPostPost, { status: 400 });
  return {
    team,
  };
}
