/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { readApiJson, ScenarioFactory, ItContext, Scenario } from 'shield/sdk';
import { IGlipPostPost } from 'shield/sdk/mocks/glip/api/post/post.post.contract';
import { GlipInitialDataHelper } from 'shield/sdk/mocks/glip/data/data';
import { GlipGroup } from 'shield/sdk/mocks/glip/types';
import { GlipScenario } from 'shield/sdk/mocks/glip/GlipScenario';

export class Success extends GlipScenario {
  post: { text: string; id: number; };
  team: GlipGroup;
  constructor(
    protected context: ItContext,
    protected glipIndexDataHelper: GlipInitialDataHelper,
    public props?: {
      teamId?: number;
      teamName?: string;
      uids?: number[];
      postText?: string;
    },
  ) {
    super(context, glipIndexDataHelper, props);
    const {
      teamName = 'Test Team with thomas',
      uids = [123],
      postText = '',
      teamId = undefined,
    } = props || {};
    const { helper } = context;
    const glipDataHelper = helper.glipDataHelper();
    const team = this.team = glipDataHelper.team.createTeam(
      teamName,
      uids,
      teamId ? { _id: teamId } : undefined,
    );
    glipIndexDataHelper.teams.insertOrUpdate(team);
    // glipIndexDataHelper.profile.insertOrUpdate(i)

    this.post = helper.mockResponse(
      readApiJson<IGlipPostPost>(require('../data/SEND_POST.SUCCESS.json')),
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
  }
}