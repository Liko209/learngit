/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:38:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import fs from 'fs';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { h, act, t, MockApp, bootstrap } from 'shield/application';
import { wait } from 'shield/utils';

jest.setTimeout(300 * 1000);

itForSdk('Service Integration test', ({ data, sdk }) => {
  const glipData = data.useInitialData(data.template.BASIC);
  const team1 = data
    .helper()
    .team.createTeam('Test Team with thomas', [123], { post_cursor: 0 });
  glipData.teams.push(team1);

  describe('test', () => {
    beforeAll(async () => {
      await sdk.setup();
    });

    afterAll(async () => {
      // await sdk.cleanUp();
    });
    it('should send post', async () => {
      const url = `/messages/${team1._id}`;
      await bootstrap({ url });

      const app = await h(<MockApp inited={true} />);

      await t(app, async () => {
        app.messageInput.input('hello');
        await app.messageInput.enter();

        // need to flush UI when try to resolve component
        app.flush();
        const postView = app.postViewByID();
        fs.writeFileSync('./out.txt', `${app.toString()}`);
      });
    });
  });
});
