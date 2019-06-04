/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-31 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import { mockEntity, mockGlobalValue } from 'shield/application';
import { MenuViewModel } from '../Menu.ViewModel';
import { CONVERSATION_TYPES } from '@/constants';

enum TestId {
  PEOPLE,
  CONVERSATION,
  CURRENT_USER,
}

const props = { id: TestId.CONVERSATION };

describe('MenuViewModel', () => {
  @testable
  class isAdmin {
    @test('should be a admin when it true in store.')
    @mockEntity({ isAdmin: true })
    t1() {
      const vm = new MenuViewModel(props);

      expect(vm.isAdmin).toBeTruthy();
    }
  }

  @testable
  class isCompanyTeam {
    @test('should be a company team when it is true in store.')
    @mockEntity({ isCompanyTeam: true })
    t1() {
      const vm = new MenuViewModel(props);

      expect(vm.isCompanyTeam).toBeTruthy();
    }
  }

  @testable
  class profileId {
    @test('should be conversation id when it is team.')
    @mockEntity({ type: CONVERSATION_TYPES.TEAM })
    t1() {
      const vm = new MenuViewModel(props);

      expect(vm.profileId).toBe(props.id);
    }

    @test('should be conversation id when it is group.')
    @mockEntity({ type: CONVERSATION_TYPES.NORMAL_GROUP })
    t2() {
      const vm = new MenuViewModel(props);

      expect(vm.profileId).toBe(props.id);
    }

    @test('should be current user id when it is me.')
    @mockGlobalValue(TestId.CURRENT_USER)
    @mockEntity({
      type: CONVERSATION_TYPES.ME,
      membersExcludeMe: [TestId.PEOPLE],
    })
    t3() {
      const vm = new MenuViewModel(props);

      expect(vm.profileId).toBe(TestId.CURRENT_USER);
    }

    @test('should be other user id when it is one to one.')
    @mockGlobalValue(TestId.CURRENT_USER)
    @mockEntity({
      type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
      membersExcludeMe: [TestId.PEOPLE],
    })
    t4() {
      const vm = new MenuViewModel(props);

      expect(vm.profileId).toBe(TestId.PEOPLE);
    }
  }
});
