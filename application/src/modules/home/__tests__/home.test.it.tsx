/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:38:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { itForSdk } from 'shield/sdk';
import { h, bootstrap, TestApp } from 'shield/application';
import { wait } from 'shield/utils';
import { LeftRail } from '../../message/container/LeftRail';
import { JuiListNavItem } from 'jui/components';
import { ConversationListItemText } from 'jui/pattern/ConversationList/ConversationListItemText';
import ThemeProvider from '@/containers/ThemeProvider';

itForSdk('Service Integration test', ({ helper, template, sdk }) => {
  helper.useInitialData(template.STANDARD);

  describe('test', () => {
    beforeAll(async () => {
      await sdk.setup();
    });

    afterAll(async () => {
      // await sdk.cleanUp();
    });
    it('should run', async () => {
      const url = '/message/42614790';
      await bootstrap({ url });
      const app: TestApp = await h(
        <ThemeProvider>
          <LeftRail />
        </ThemeProvider>,
      );

      await app.test(async () => {
        const navs = app.find(JuiListNavItem);

        // navs.forEach(node => node.simulate('click'));
        const list = app.find(ConversationListItemText);
        // wrapper.unmount();
      });
      await wait(100);
    });
  });
});
