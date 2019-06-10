/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 18:14:57
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { VoicemailViewModel } from '../Voicemail.ViewModel';

describe('VoicemailViewModel', () => {
  @testable
  class getListHandler {
    @test('should return list handle when show voice mail list')
    t1() {
      const vm = new VoicemailViewModel();
      expect(vm.listHandler).toBeTruthy();
    }
  }
});
