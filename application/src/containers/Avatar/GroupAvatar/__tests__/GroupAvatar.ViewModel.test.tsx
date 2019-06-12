/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-12 10:25:08
 * Copyright © RingCentral. All rights reserved.
 */

import { test, testable } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { GroupAvatarViewModel } from '../GroupAvatar.ViewModel';
import defaultGroupAvatar from '../defaultGroupAvatar.png';
import defaultTeamAvatar from '../defaultTeamAvatar.png';

describe('GroupAvatarViewModel', () => {
  @testable
  class cid {
    @test('should return correct value when get cid')
    t1() {
      const vm = new GroupAvatarViewModel({ cid: 2031622 });
      expect(vm._cid).toBe(2031622);
    }
  }

  @testable
  class src {
    @test('should return defaultTeamAvatar when group is team')
    @mockEntity({ isTeam: true })
    t1() {
      const vm = new GroupAvatarViewModel({ cid: 2031622 });
      expect(vm.src).toBe(defaultTeamAvatar);
    }

    @test('should return defaultGroupAvatar when group is group')
    @mockEntity({ isTeam: false })
    t2() {
      const vm = new GroupAvatarViewModel({ cid: 2031622 });
      expect(vm.src).toBe(defaultGroupAvatar);
    }
  }
})
