/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 18:14:57
 * Copyright © RingCentral. All rights reserved.
 */
import { when } from 'mobx';
import { test, testable } from 'shield';
import { mockService } from 'shield/sdk';
import { globalStore } from 'shield/integration-test';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { RCInfoService } from 'sdk/module/rcInfo';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { VoicemailViewModel } from '../Voicemail.ViewModel';
import { config } from '../../../module.config';
import { registerModule } from 'shield/utils';
import { container } from 'framework/ioc';
import { PhoneStore } from '../../../store';

registerModule(config);

describe('VoicemailViewModel', () => {
  const voicemailService = {
    name: ServiceConfig.VOICEMAIL_SERVICE,
    fetchVoicemails() {},
  };

  @testable
  class listHandler {
    @test('should return list handle when show voice mail list')
    t1() {
      const vm = new VoicemailViewModel();
      expect(vm.listHandler).toBeTruthy();
    }
  }

  @testable
  class fetchData {
    @test('should be call fetchVoicemails not anchor when use _fetchData')
    @mockService(voicemailService, 'fetchVoicemails', true)
    async t1() {
      const vm = new VoicemailViewModel();
      const ret = await vm._fetchData(QUERY_DIRECTION.OLDER, 1);
      expect(voicemailService.fetchVoicemails).toHaveBeenCalledWith({
        limit: 1,
        direction: QUERY_DIRECTION.NEWER,
      });
      expect(ret).toBeTruthy();
    }

    @test('should be call fetchVoicemails with anchor when use _fetchData')
    @mockService(voicemailService, 'fetchVoicemails', true)
    async t2() {
      const vm = new VoicemailViewModel();
      const ret = await vm._fetchData(QUERY_DIRECTION.NEWER, 1, {
        id: 1,
        sortValue: 1,
      });
      expect(voicemailService.fetchVoicemails).toHaveBeenCalledWith({
        limit: 1,
        direction: QUERY_DIRECTION.OLDER,
        anchorId: 1,
      });
      expect(ret).toBeTruthy();
    }

    @test('should show error page when fetch data error [JPT-2336] [JPT-2369]')
    @mockService(voicemailService, 'fetchVoicemails', () => {
      throw new Error('error');
    })
    async t3() {
      const vm = new VoicemailViewModel();
      expect(vm.isError).toBeFalsy();
      await vm._fetchData(QUERY_DIRECTION.OLDER, 1, {
        id: 1,
        sortValue: 1,
      });
      expect(vm.isError).toBeTruthy();
    }
  }

  @testable
  class onVoicemailPlay {
    @test(
      'should pause audio when have a incoming call or make a call [JPT-2222]',
    )
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    async t1() {
      const vm = new VoicemailViewModel({});
      vm.onVoicemailPlay = jest.fn();

      const media = {
        pause: jest.fn(),
      };
      const phoneStore = container.get(PhoneStore);

      phoneStore.addAudio(1, {
        media,
      });

      globalStore.set(GLOBAL_KEYS.INCOMING_CALL, true);

      await when(
        () => getGlobalValue(GLOBAL_KEYS.INCOMING_CALL),
        () => expect(media.pause).toHaveBeenCalled(),
      );
    }
  }
});
