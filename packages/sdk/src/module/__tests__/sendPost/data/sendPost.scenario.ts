/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ItContext, readJson, ScenarioFactory } from 'shield/sdk';
import { IGlipPostPost } from 'shield/sdk/mocks/server/glip/api/post/post.post.contract';
import { GlipInitialDataHelper } from 'shield/sdk/mocks/server/glip/data/data';
import { createResponse } from 'shield/sdk/mocks/server/utils';

function createScenarioFactory<T extends ScenarioFactory>(factory: T): T {
  return factory;
}

abstract class IScenario {
  success;
  fail;
}
class PostSendScenario extends  IScenario {
  constructoror() {

  }
  success = () => {};
  fail = () => {};
}


class PostEditScenario extends  IScenario {
  constructoror() {

  }
  success = () => {};
  fail = () => {};
}

const PostScenario = {
  send: IScenario = {
    success() {

    }
  }
  edit(): IScenario,
}
postScenario : PostScenario;

export { postScenario };


sendPostFail


export const sendPostSuccess = createScenarioFactory(
  (context, glipIndexDataHelper) => {
    const { helper } = context;
    const glipDataHelper = helper.glipDataHelper();
    const team = glipDataHelper.team.createTeam('Test Team with thomas', [123]);
    glipIndexDataHelper.teams.insertOrUpdate(team);
    // glipIndexDataHelper.profile.insertOrUpdate()

    const post = helper.mockResponse(
      readJson<IGlipPostPost>(require('./SEND_POST.SUCCESS.json')),
      data => {
        // modify the response
        data.request.data!.group_id = team._id;
        data.response.data.group_id = team._id;
        data.response.data._id = helper
          .glipDataHelper()
          .post.factory.build()._id;
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
  },
);

export const sendPostFail = createScenarioFactory(
  (context, glipIndexDataHelper) => {
    const { helper } = context;
    const team = helper
      .glipDataHelper()
      .team.createTeam('Test Team with thomas', [123]);
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

export const resendPost = createScenarioFactory(
  (context, glipIndexDataHelper) => {
    const sendPostFailScenario = sendPostFail(context, glipIndexDataHelper);
    const { helper } = context;
    // const team = helper
    //   .glipDataHelper()
    //   .team.createTeam('Test Team with thomas', [123]);
    // glipIndexDataHelper.teams.insertOrUpdate(team);
    const post = helper.mockResponse(
      readJson<IGlipPostPost>(require('./SEND_POST.SUCCESS.json')),
      data => {
        data.response.data.group_id = sendPostFailScenario.team._id;
        data.response.data.text = 'test post 2';
        data.response.data._id = helper
          .glipDataHelper()
          .post.factory.build()._id;
        return data.request.data;
      },
      (request, requestResponse) => {
        return createResponse({
          ...requestResponse.response,
          data: {
            ...requestResponse.response.data,
            unique_id: request.data.unique_id,
          },
        });
      },
    );
    helper.mockApi(IGlipPostPost, {
      status: 400,
      statusText: 'mock send post fail.',
    });
    return {
      post,
      team: sendPostFailScenario.team,
    };
  },
);

