/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:38:28
 * Copyright © RingCentral. All rights reserved.
 */

import fs from 'fs';
import { jit } from 'shield/sdk/SdkItFramework';
import { h } from 'shield/application/it';

jest.setTimeout(300 * 1000);

jit('Service Integration test', ({ helper, template, sdk }) => {
  const glipData = helper.useInitialData(template.BASIC);
  const team1 = helper
    .glipDataHelper()
    .team.createTeam('Test Team with thomas', [123], { post_cursor: 0 });
  glipData.teams.push(team1);

  describe('test', () => {
    beforeAll(async () => {
      await sdk.setup();
    });

    it('should send post', async () => {
      const app = await h({ url: `/messages/${team1._id}` });

      await app.test(async () => {
        const message = 'hello';
        app.messageInput.input(message);
        await app.messageInput.enter();

        const postView = app.postViewByID();
        expect(postView.textMessageView().text()).toEqual(message);
        fs.writeFileSync('./out.txt', `${app.toString()}`);
      });
    });
  });
});
