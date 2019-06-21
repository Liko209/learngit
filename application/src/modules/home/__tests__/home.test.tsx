import React from 'react';
import { MemoryRouter } from 'react-router';
import { mountWithTheme } from 'shield/utils';
import { itForSdk } from 'sdk/__tests__/SdkItFramework';
import { container, Jupiter } from 'framework';
// import debounce from 'lodash/debounce';
import { LeftRail } from '../../message/container/LeftRail';
import { ConversationListItem } from '../../message/container/ConversationList/ConversationListItem';
import { JuiConversationListItem } from 'jui/pattern/ConversationList';
import { JuiListNavItem } from 'jui/components';
import {
  JuiConversationList,
  JuiConversationListSection,
} from 'jui/pattern/ConversationList';
import * as router from '../../router/module.config';
import * as app from '../../app/module.config';
import visibilityChangeEvent from '@/store/base/visibilityChangeEvent';

visibilityChangeEvent.mockImplementation(jest.fn());

jest.mock('@/store/base/visibilityChangeEvent');
// jest.useFakeTimers();
jest.mock('sdk/utils/phoneParser');
jest.mock('sdk/framework/account/helper', () => {
  return {
    fetchWhiteList: jest.fn().mockReturnValue({}),
  };
});
jest.mock('foundation/src/network/client/http/Http');
jest.mock('foundation/src/network/client/socket/Socket');

jest.setTimeout(30000);
async function delay(t: number = 10) {
  return new Promise(resolve => setTimeout(resolve, t));
}

itForSdk('Service Integration test', ({ server, data, sdk }) => {
  const glipData = data.useInitialData(data.template.STANDARD);

  data.apply();

  describe('test', () => {
    beforeAll(async () => {
      await sdk.setup();
      const jupiter = container.get(Jupiter);
      jupiter.registerModule(router.config);
      // jupiter.registerModule(home.config);
      jupiter.registerModule(app.config);
      // jupiter.registerModule(GlobalSearch.config);
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
      const navs = wrapper.find(JuiListNavItem);
      // navs.forEach(node => node.simulate('click'));
      const p = new Promise(resolve => {
        setTimeout(() => {
          wrapper.update();
          const list = wrapper.find(JuiConversationListItem);
          // const list = wrapper.find('.conversation-list-item');
          console.log('TCL: list', list.length);
          // wrapper.render();
          fs.writeFileSync('./test-render.html', wrapper.debug());
          wrapper.unmount();
          resolve();
        });
      });
      await p;
    });
  });
});
