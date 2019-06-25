/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 18:14:57
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockService } from 'shield/sdk';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { VoicemailViewModel } from '../Voicemail.ViewModel';

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
      expect(voicemailService.fetchVoicemails).toHaveBeenCalledWith(
        1,
        QUERY_DIRECTION.NEWER,
        undefined,
      );
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
      expect(voicemailService.fetchVoicemails).toHaveBeenCalledWith(
        1,
        QUERY_DIRECTION.OLDER,
        1,
      );
      expect(ret).toBeTruthy();
    }

    @test(
      'should toast error message when fetch data failed due to network error [JPT-2135]',
    )
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
});
