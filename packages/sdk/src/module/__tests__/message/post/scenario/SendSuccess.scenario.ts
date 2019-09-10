/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import {
  readApiJson,
  ItContext,
  get,
} from 'shield/sdk';
import { IGlipPostPost } from 'shield/sdk/mocks/glip/api/post/post.post.contract';
import { GlipInitialDataHelper } from 'shield/sdk/mocks/glip/data/data';
import { GlipGroup, GlipPost } from 'shield/sdk/mocks/glip/types';
import { GlipScenario } from 'shield/sdk/mocks/glip/GlipScenario';
import { UpdateSpec, update } from 'foundation/src/utils/update';

export class Success extends GlipScenario {
  post: { text: string; id: number };
  team: GlipGroup;
  constructor(
    protected context: ItContext,
    protected glipIndexDataHelper: GlipInitialDataHelper,
    public props: {
      targetTeam?: UpdateSpec<GlipGroup>;
      sendPost?: UpdateSpec<GlipPost>;
    },
  ) {
    super(context, glipIndexDataHelper, props);
    const { helper } = context;
    const glipDataHelper = helper.glipDataHelper();
    const team = (this.team = update(
      glipDataHelper.team.createTeam('Test Team with thomas', [123]),
      get(props, v => v.targetTeam),
    ));
    glipIndexDataHelper.teams.insertOrUpdate(team);
    const rawJson = readApiJson<IGlipPostPost>(
      require('../data/SEND_POST.SUCCESS.json'),
    );
    const apiJson = update(rawJson, {
      request: {
        data: {
          group_id: team._id,
        },
      },
      response: {
        data: update(get(props, v => v.sendPost, rawJson.response.data)!, {
          group_id: team._id,
        }),
      },
    });

    this.post = helper.mockResponse(apiJson, data => ({
      text: data.response.data.text,
      id: data.response.data._id,
    }));
  }
}
