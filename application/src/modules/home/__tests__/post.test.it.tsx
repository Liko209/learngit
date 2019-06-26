/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:38:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { MemoryRouter } from 'react-router';
import { mountWithTheme, asyncTest } from 'shield/utils';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { container, Jupiter } from 'framework';
import { LeftRail } from '../../message/container/LeftRail';
import { JuiListNavItem } from 'jui/components';
import { ConversationListItemText } from 'jui/pattern/ConversationList/ConversationListItemText';
import * as router from '../../router/module.config';
import * as app from '../../app/module.config';
import * as message from '../../message/module.config';

import { App } from '../../app/container';
import history from '@/history';

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
      const jupiter = container.get(Jupiter);
      jupiter.registerModule(router.config);
      jupiter.registerModule(app.config);
      jupiter.registerModule(message.config);
    });

    afterAll(async () => {
      // await sdk.cleanUp();
    });
    it('should send post', async () => {
      const url = `/message/${team1._id}`;
      history.push(url);
      const wrapper = mountWithTheme(<App />);
      await asyncTest(() => {
        wrapper.update();
        console.log(wrapper.debug());
      },              10);
    });
  });
});
