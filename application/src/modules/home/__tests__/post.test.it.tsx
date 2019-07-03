/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:38:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import fs from 'fs';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { h, act, TestApp, MockApp, bootstrap } from 'shield/application';
import notificationCenter from 'sdk/service/notificationCenter';
import { service } from 'sdk';
import { wait } from 'shield/utils';
import history from '@/history';

jest.setTimeout(300 * 1000);

itForSdk('Service Integration test', ({ server, data, sdk }) => {
  const glipData = data.useInitialData(data.template.BASIC);
  const team1 = data
    .helper()
    .team.createTeam('Test Team with thomas', [123], { post_cursor: 0 });
  glipData.teams.push(team1);
  data.apply();

  describe('test', () => {
    beforeAll(async () => {
      await sdk.setup();
    });

    afterAll(async () => {
      // await sdk.cleanUp();
    });
    it('should send post', async () => {
      const url = `/messages/${team1._id}`;
      let app: TestApp;
      await bootstrap({ url });

      await act(async () => {
        app = h(<MockApp inited={true} />);
        notificationCenter.emitKVChange(service.SERVICE.STOP_LOADING);
        notificationCenter.emitKVChange(service.SERVICE.LOGIN);
      });

      // await wait(100);

      await act(async () => {
        app.flush();
        const input = app.messageInput;
        // const testMessage = 'hello';
        // input.input(testMessage);

        app.messageEmojiButton.click();
        app.flush();
        await wait(100);

        fs.writeFileSync('./out.txt', `${input.toString()}`);
      });
    });
  });
});
