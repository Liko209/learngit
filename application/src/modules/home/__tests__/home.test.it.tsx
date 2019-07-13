/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:38:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { itForSdk } from 'shield/sdk';
import { h, act, bootstrap, TestApp, WrapperType } from 'shield/application';
import { wait } from 'shield/utils';
import { container, Jupiter } from 'framework';
import { LeftRail } from '../../message/container/LeftRail';
import { JuiListNavItem } from 'jui/components';
import { ConversationListItemText } from 'jui/pattern/ConversationList/ConversationListItemText';
import ThemeProvider from '@/containers/ThemeProvider';
import * as router from '../../router/module.config';
import * as app from '../../app/module.config';

itForSdk('Service Integration test', ({ helper, template, sdk }) => {
  helper.useInitialData(template.STANDARD);

  describe('test', () => {
    beforeAll(async () => {
      await sdk.setup();
      const jupiter = container.get(Jupiter);
      jupiter.registerModule(router.config);
      jupiter.registerModule(app.config);
    });

    afterAll(async () => {
      // await sdk.cleanUp();
    });
    it('should run', async () => {
      const url = '/message/42614790';
      await bootstrap({ url });
      let wrapper: TestApp;
      await act(async () => {
        wrapper = h(
          <ThemeProvider>
            <LeftRail />
          </ThemeProvider>,
          WrapperType.Enzyme,
        );
        const navs = wrapper.find(JuiListNavItem);

        // navs.forEach(node => node.simulate('click'));
        const list = wrapper.find(ConversationListItemText);
        list.forEach(node => console.warn(node.toString()));
        // wrapper.unmount();
      });
      await wait(100);
    });
  });
});
