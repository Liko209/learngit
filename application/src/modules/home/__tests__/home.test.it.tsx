import React from 'react';
import { MemoryRouter } from 'react-router';
import { mountWithTheme } from 'shield/utils';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { container, Jupiter } from 'framework';
import { LeftRail } from '../../message/container/LeftRail';
import { JuiListNavItem } from 'jui/components';
import { ConversationListItemText } from 'jui/pattern/ConversationList/ConversationListItemText';
import * as router from '../../router/module.config';
import * as app from '../../app/module.config';
import visibilityChangeEvent from '@/store/base/visibilityChangeEvent';

visibilityChangeEvent.mockImplementation(jest.fn());

jest.mock('@/store/base/visibilityChangeEvent');

async function delay(t: number = 10) {
  return new Promise(resolve => setTimeout(resolve, t));
}

jest.setTimeout(30000);

itForSdk('Service Integration test', ({ server, data, sdk }) => {
  const glipData = data.useInitialData(data.template.STANDARD);

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

      const p = new Promise(resolve => {
        setTimeout(() => {
          wrapper.update();
          const navs = wrapper.find(JuiListNavItem);
          navs.forEach(node => node.simulate('click'));
          const list = wrapper.find(ConversationListItemText);
          list.forEach(node => console.warn(node.text()));
          wrapper.unmount();
          resolve();
        },         0);
      });
      await p;
    });
  });
});
