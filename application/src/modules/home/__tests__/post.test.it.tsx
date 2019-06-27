/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:38:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount, ReactWrapper } from 'enzyme';
import { asyncTest } from 'shield/utils';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { container, Jupiter } from 'framework';
import { LeftRail } from '../../message/container/LeftRail';
import { JuiListNavItem } from 'jui/components';
import { ConversationListItemText } from 'jui/pattern/ConversationList/ConversationListItemText';

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

      const leaveBlocker = require('@/modules/leave-blocker/module.config');
      const router = require('@/modules/router/module.config');
      const app = require('@/modules/app/module.config');
      const message = require('@/modules/message/module.config');
      const GlobalSearch = require('@/modules/GlobalSearch/module.config');
      const home = require('@/modules/home/module.config');
      const featuresFlag = require('@/modules/featuresFlags/module.config');
      const notification = require('@/modules/notification/module.config');
      const setting = require('@/modules/setting/module.config');

      const jupiter = container.get(Jupiter);

      jupiter.registerModule(leaveBlocker.config);
      jupiter.registerModule(featuresFlag.config);
      jupiter.registerModule(router.config);
      jupiter.registerModule(home.config);
      jupiter.registerModule(app.config);
      jupiter.registerModule(message.config);
      jupiter.registerModule(GlobalSearch.config);
      jupiter.registerModule(notification.config);
      jupiter.registerModule(setting.config);

      await jupiter.bootstrap();
    });

    afterAll(async () => {
      // await sdk.cleanUp();
    });
    it('should send post', async () => {
      const url = `/message/${team1._id}`;
      history.push(url);
      let wrapper: ReactWrapper;
      await act(async () => {
        wrapper = mount(<App />);
        await asyncTest(() => {
          act(() => {
            // wrapper.update();
            console.log(wrapper.debug());
          });
        },              10);
      });
    });
  });
});
