/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ScenarioFactory } from 'shield/sdk';
import { wait } from 'shield/utils/asyncTest';
import dataDispatcher from 'sdk/component/DataDispatcher';
import { SOCKET } from 'sdk/service/eventKey';

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

    const waitSocketIncoming = async (eventKey: string) => {
      await new Promise(resolve => {
        dataDispatcher.once(eventKey, async () => {
          resolve();
        });
      });
      await wait();
    };
    return {
      emitPost: async () => {
        helper.socketServer.emitPacket(
          require('../data/RECEIVE_POST.SOCKET.json'),
        );
        await waitSocketIncoming(SOCKET.POST);
      },
    };
  },
);

export const incomingPost = { success };
