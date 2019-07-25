/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ItContext, readJson } from 'shield/sdk';
import { IGlipPostPost } from 'shield/sdk/mocks/server/glip/api/post/post.post.contract';

export function createSendPostScenario(context: ItContext) {
  const { helper, template } = context;
  const glipData = helper.useInitialData(template.BASIC);
  const team = helper
    .glipDataHelper()
    .team.createTeam('Test Team with thomas', [123], {
      post_cursor: 0,
    });
  glipData.teams.push(team);
  const post = helper.mockResponse(
    readJson<IGlipPostPost>(require('./SEND_POST.SUCCESS.json')),
    data => {
      // modify the response
      data.request.data!.group_id = team._id;
      data.response.data.group_id = team._id;
      data.response.data._id = helper.glipDataHelper().post.factory.build()._id;
      return {
        text: data.request.data!.text!,
        id: data.response.data._id,
      };
    },
  );
  return {
    post,
    team,
  };
}
