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

itForSdk('Service Integration test', ({ server, data, sdk }) => {
  data.useInitialData(data.template.STANDARD);
  data.apply();

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
      const wrapper = mountWithTheme(
        <MemoryRouter initialEntries={['/message/42614790']}>
          <LeftRail />
        </MemoryRouter>,
      );

      await asyncTest(() => {
        console.warn(88888);
        wrapper.update();

        const navs = wrapper.find(JuiListNavItem);
        navs.forEach(node => node.simulate('click'));
        const list = wrapper.find(ConversationListItemText);
        list.forEach(node => console.warn(node.text()));
        wrapper.unmount();
      });
    });
  });
});
