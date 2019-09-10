/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { ItContext, ISocketInfo } from 'shield/sdk';
import { get } from 'shield/sdk/utils';
import { wait } from 'shield/utils/asyncTest';
import dataDispatcher from 'sdk/component/DataDispatcher';
import { SOCKET } from 'sdk/service/eventKey';
import { GlipScenario } from 'shield/sdk/mocks/glip/GlipScenario';
import { GlipInitialDataHelper } from 'shield/sdk/mocks/glip/data/data';
import { update, UpdateSpec } from 'foundation/utils/update';
import { GlipPost, GlipGroup } from 'shield/sdk/mocks/glip/types';
import _ from 'lodash';

type SocketMessage<T> = ISocketInfo<{
  body: {
    timestamp: number;
    message_id: string;
    pending_object_ids: [];
    objects: [T[]];
  };
}>;

export class IncomingPost extends GlipScenario {
  constructor(
    protected context: ItContext,
    protected glipIndexDataHelper: GlipInitialDataHelper,
    public props: {
      post?: UpdateSpec<GlipPost>;
      team?: UpdateSpec<GlipGroup>;
    },
  ) {
    super(context, glipIndexDataHelper, props);
    const { helper } = context;
    const glipDataHelper = helper.glipDataHelper();
    const team = update(
      glipDataHelper.team.createTeam('Test Team with thomas', [123]),
      get(props, v => v.team),
    );

    glipIndexDataHelper.teams.insertOrUpdate(team);
  }

  emitPost = async () => {
    const packet: SocketMessage<
      GlipPost
    > = require('../data/RECEIVE_POST.SOCKET.json');
    const modifyPacket = update(packet, {
      data: {
        body: {
          timestamp: 122,
          objects: [[get(this.props, p => p.post)]],
        },
      },
    });
    this.context.helper.socketServer.emitPacket(modifyPacket);
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
