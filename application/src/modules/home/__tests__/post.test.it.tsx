/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:38:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import fs from 'fs';
import { mount } from 'enzyme';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { h, act, TestApp, MockApp } from 'shield/application';
import history from '@/history';
import notificationCenter from 'sdk/service/notificationCenter';
import { service } from 'sdk';
import { wait } from 'shield/utils';

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
      const url = `/message/${team1._id}?code=123`;
      history.push(url);
      let wrapper: TestApp;

      await act(async () => {
        wrapper = h(mount(<MockApp />));
        notificationCenter.emitKVChange(service.SERVICE.STOP_LOADING);
        notificationCenter.emitKVChange(service.SERVICE.LOGIN);
      });

      await act(async () => {
        wrapper.update();
        const leftNav = wrapper.aboutDialog;
        console.warn('wait 76', leftNav);

        // const str = wrapper.debug();
        await wait(100);
        const str = wrapper.debug();
        fs.writeFileSync('./out.txt', str);
        // wrapper.unmount();
        wrapper.update();
      });
    });
  });
});
