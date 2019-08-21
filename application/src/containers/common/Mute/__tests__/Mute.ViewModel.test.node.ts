/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-21 16:51:32
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import { mockEntity } from 'shield/application';
import { MuteViewModel } from '../Mute.ViewModel';

describe('MuteViewModel', () => {
  @testable
  class isMuted {
    @test('should be true when muteAll is true')
    @mockEntity({ muteAll: true })
    async t1() {
      const muteVM = new MuteViewModel();
      expect(muteVM.isMuted).toBeTruthy();
    }

    @test('should be false when muteAll is false')
    @mockEntity({ muteAll: false })
    async t2() {
      const muteVM = new MuteViewModel();
      expect(muteVM.isMuted).toBeFalsy();
    }
  }
});
