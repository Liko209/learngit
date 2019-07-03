/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 16:38:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import fs from 'fs';
// import { mount } from 'enzyme';
import TestRenderer, { ReactTestRenderer } from 'react-test-renderer';
import { itForSdk } from 'shield/sdk/SdkItFramework';
import { h, act, TestApp, MockApp, bootstrap } from 'shield/application';
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
      let wrapper: TestApp;
      await bootstrap({ url });
      act(() => {
        // wrapper = h(mount(<MockApp />));
        wrapper = h(<MockApp inited={true} />);
        notificationCenter.emitKVChange(service.SERVICE.STOP_LOADING);
        notificationCenter.emitKVChange(service.SERVICE.LOGIN);
      });

      await wait(1000);

      act(() => {
        // wrapper.update();
        const inst = wrapper;
        if (inst) {
          const about = inst.aboutDialog;
          console.warn(888888, about);
        }
        console.warn(wrapper.toString());
        fs.writeFileSync('./out.txt', `${wrapper.toString()}`);
      });
    });
  });
});
