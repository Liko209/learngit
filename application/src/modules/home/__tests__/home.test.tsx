import React from 'react';
import { MemoryRouter } from 'react-router';
import { mountWithTheme } from 'shield/utils';
import { itForSdk } from 'sdk/__tests__/SdkItFramework';
import { container, Jupiter } from 'framework';
// import debounce from 'lodash/debounce';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { GlobalSearch as GS, GlobalSearchStore } from '../../GlobalSearch';
import { LeftRail } from '../../message/container/LeftRail';
import * as home from '../module.config';
import * as app from '../../app/module.config';
import * as router from '../../router/module.config';
import * as GlobalSearch from '../../GlobalSearch/module.config';
import { AccountService } from 'sdk/module/account';

// jest.mock('lodash/debounce');
jest.useFakeTimers();
jest.mock('sdk/utils/phoneParser');
jest.mock('sdk/framework/account/helper', () => {
  return {
    fetchWhiteList: jest.fn().mockReturnValue({}),
  };
});
jest.mock('foundation/src/network/client/http/Http');
jest.mock('foundation/src/network/client/socket/Socket');

async function delay(t: number = 10) {
  return new Promise(resolve => setTimeout(resolve, t));
}

itForSdk('Service Integration test', ({ server, data, sdk }) => {
  const glipData = data.useInitialData(data.template.STANDARD);
  // data.helper().team.createTeam('Test Team with thomas', [123]),
  //   glipData.teams.push(
  //     data.helper().team.createTeam('Test Team with thomas', [123]),
  //     ...data.helper().team.factory.buildList(2),
  //   );
  // glipData.people.push(
  //   data.helper().person.build({ display_name: 'Special Name +86789' }),
  // );
  data.apply();
  beforeAll(async () => {
    await sdk.setup();
    const jupiter = container.get(Jupiter);
    jupiter.registerModule(router.config);
    jupiter.registerModule(home.config);
    jupiter.registerModule(app.config);
    jupiter.registerModule(GlobalSearch.config);
  });

  afterAll(async () => {
    await sdk.cleanUp();
  });
  describe('test', () => {
    it('should run', () => {
      const globalSearchStore = container.get(GlobalSearchStore);
      globalSearchStore.open = true;
      const wrapper = mountWithTheme(
        <MemoryRouter initialEntries={['/message/42614790']}>
          <LeftRail />
        </MemoryRouter>,
      );
      const as: AccountService = ServiceLoader.getInstance(
        ServiceConfig.ACCOUNT_SERVICE,
      );
      console.warn(as.isGlipLogin(), as.isLoggedIn());
      // console.warn(wrapper.debug());
      // expect(wrapper.find(UnifiedLogin).length).toEqual(1);
    });
  });
});
