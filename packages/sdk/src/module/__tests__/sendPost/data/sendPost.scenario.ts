/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { readJson, ScenarioFactory } from 'shield/sdk';
import { IGlipPostPost } from 'shield/sdk/mocks/server/glip/api/post/post.post.contract';

function createScenarioFactory<T extends ScenarioFactory>(factory: T): T {
  return factory;
}

const success = createScenarioFactory(
  (
    context,
    glipIndexDataHelper,
    props?: {
      teamId?: number;
      teamName?: string;
      uids?: number[];
      postText?: string;
    },
  ) => {
    const {
      teamName = 'Test Team with thomas',
      uids = [123],
      postText = '',
      teamId = undefined,
    } = props || {};
    const { helper } = context;
    const glipDataHelper = helper.glipDataHelper();
    const team = glipDataHelper.team.createTeam(
      teamName,
      uids,
      teamId ? { _id: teamId } : undefined,
    );
    glipIndexDataHelper.teams.insertOrUpdate(team);
    // glipIndexDataHelper.profile.insertOrUpdate()

    const post = helper.mockResponse(
      readJson<IGlipPostPost>(require('./SEND_POST.SUCCESS.json')),
      data => {
        // modify the response
        data.request.data!.group_id = team._id;
        data.response.data.group_id = team._id;
        postText && (data.response.data.text = postText);
        data.response.data._id = helper
          .glipDataHelper()
          .post.factory.build()._id;
        return {
          text: postText || data.request.data!.text!,
          id: data.response.data._id,
        };
      },
    );
    return {
      post,
      team,
    };
  },
);

const fail = createScenarioFactory(
  (
    context,
    glipIndexDataHelper,
    props?: { teamName?: string; uids?: number[] },
  ) => {
    const { teamName = 'Test Team with thomas', uids = [123] } = props || {};
    const { helper } = context;
    const team = helper.glipDataHelper().team.createTeam(teamName, uids);
    glipIndexDataHelper.teams.insertOrUpdate(team);
    helper.mockApi(IGlipPostPost, {
      status: 400,
      statusText: 'mock send post fail.',
    });
    return {
      team,
    };
  },
);

export { success, fail };
