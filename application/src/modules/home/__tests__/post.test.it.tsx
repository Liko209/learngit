/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:38:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import fs from 'fs';
import { act } from 'react-dom/test-utils';
import { mount, shallow, ReactWrapper, ShallowWrapper } from 'enzyme';
import { service } from 'sdk';
import { asyncTest, wait } from 'shield/utils';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { h, TestApp } from 'shield/application';
import { container, Jupiter } from 'framework';
import notificationCenter from 'sdk/service/notificationCenter';

import { App } from '@/modules/app/container';
import history from '@/history';

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
      const url = `/message/${team1._id}?code=123`;
      history.push(url);
      let wrapper: TestApp;
      await act(async () => {
        wrapper = h(mount(<App />));
        notificationCenter.emitKVChange(service.SERVICE.STOP_LOADING);
      });

      await act(async () => {
        wrapper.update();
      });
      await wait(10 * 1000);
      const leftNav = wrapper.leftNav;
      console.warn('wait 76', leftNav);

      // const str = wrapper.debug();
      const str = leftNav.debug();
      fs.writeFileSync('./out.txt', str);

      console.warn('unmount 76');
      // wrapper.unmount();
    });
  });
});
