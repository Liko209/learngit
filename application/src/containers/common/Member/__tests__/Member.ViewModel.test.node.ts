import { getEntity } from '../../../../store/utils';
import { MemberViewModel } from '../Member.ViewModel';
import { CONVERSATION_TYPES as TYPES } from '@/constants';
import { ENTITY_NAME } from '@/store';
import { container } from 'framework/ioc';

jest.mock('../../../../store/utils');

const types = Array.from({ ...TYPES, length: 5 });
const mockGroups = types.map((type, index) => ({
  type: index,
  id: index,
  members: [3331, 3332, 3333, 3334, 3335],
}));

const vmPropsFactory = (id: number) => ({ id });

describe('MemberViewModel', () => {
  describe('showMembersCount [JPT-45]', () => {
    beforeEach(() => {
      (getEntity as jest.Mock).mockImplementation((entityName, id) => {
        if (entityName !== ENTITY_NAME.GROUP) return {};

        return mockGroups.find(({ id: groupId }) => groupId === id) || {};
      });

      container.get = jest.fn().mockReturnValue({
        isRightRailOpen: false,
      });
    });

    it('should be show when type is team', () => {
      const vm = new MemberViewModel(vmPropsFactory(TYPES.TEAM));

      expect(vm.showMembersCount).toBeTruthy();
    });

    it('should be show when type is group', () => {
      const vm = new MemberViewModel(vmPropsFactory(TYPES.NORMAL_GROUP));

      expect(vm.showMembersCount).toBeTruthy();
    });

    it('should be show when type is me', () => {
      const vm = new MemberViewModel(vmPropsFactory(TYPES.ME));

      expect(vm.showMembersCount).toBeFalsy();
    });

    it('should be show when type is sms', () => {
      const vm = new MemberViewModel(vmPropsFactory(TYPES.SMS));

      expect(vm.showMembersCount).toBeFalsy();
    });

    it('should be show when type is one to one', () => {
      const vm = new MemberViewModel(vmPropsFactory(TYPES.NORMAL_ONE_TO_ONE));

      expect(vm.showMembersCount).toBeFalsy();
    });
  });

  describe('showMembersCount when right rail is open', () => {
    beforeEach(() => {
      (getEntity as jest.Mock).mockImplementation((entityName, id) => {
        if (entityName !== ENTITY_NAME.GROUP) return {};

        return mockGroups.find(({ id: groupId }) => groupId === id) || {};
      });

      container.get = jest.fn().mockReturnValue({
        isRightRailOpen: true,
      });
    });

    it('should not be show when type is team', () => {
      const vm = new MemberViewModel(vmPropsFactory(TYPES.TEAM));

      expect(vm.showMembersCount).toBeFalsy();
    });

    it('should not be show when type is group', () => {
      const vm = new MemberViewModel(vmPropsFactory(TYPES.NORMAL_GROUP));

      expect(vm.showMembersCount).toBeFalsy();
    });
  });

  describe('Members count sync[JPT-1367]', () => {
    it('should be sync when the group/team member count change', () => {
      const group = mockGroups[TYPES.TEAM];
      const vm = new MemberViewModel(vmPropsFactory(TYPES.TEAM));

      group.members = group.members.filter(id => id !== 3331);
      expect(vm.membersCount).toBe(group.members.length);
    });
  });
});
