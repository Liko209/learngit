/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ScenarioFactory, ItContext } from 'shield/sdk';
import { wait } from 'shield/utils/asyncTest';
import dataDispatcher from 'sdk/component/DataDispatcher';
import { SOCKET } from 'sdk/service/eventKey';
import { GlipScenario } from 'shield/sdk/mocks/glip/GlipScenario';
import { GlipInitialDataHelper } from 'shield/sdk/mocks/glip/data/data';

export class IncomingPost extends GlipScenario {
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
    const team = glipDataHelper.team.createTeam(
      teamName,
      uids,
      teamId ? { _id: teamId } : undefined,
    );
    glipIndexDataHelper.teams.insertOrUpdate(team);
  }
  emitPost = async () => {
    this.context.helper.socketServer.emitPacket(
      require('../data/RECEIVE_POST.SOCKET.json'),
    );
    const waitSocketIncoming = async (eventKey: string) => {
      await new Promise(resolve => {
        dataDispatcher.once(eventKey, async () => {
          resolve();
        });
      });
      await wait();
    };
    await waitSocketIncoming(SOCKET.POST);
  };
}
