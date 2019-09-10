/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-12 10:25:08
 * Copyright © RingCentral. All rights reserved.
 */

import { test, testable } from 'shield';
import { mockEntity } from 'shield/application/mockEntity';
import { GroupAvatarViewModel } from '../GroupAvatar.ViewModel';
import defaultGroupAvatar from 'jui/assets/jupiter-icon/icon-default-group-avatar.svg';
import defaultTeamAvatar from 'jui/assets/jupiter-icon/icon-default-team-avatar.svg';

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
      expect(vm.icon).toBe(defaultTeamAvatar);
    }

    @test('should return defaultGroupAvatar when group is group')
    @mockEntity({ isTeam: false })
    t2() {
      const vm = new GroupAvatarViewModel({ cid: 2031622 });
      expect(vm.icon).toBe(defaultGroupAvatar);
    }
  }
});
