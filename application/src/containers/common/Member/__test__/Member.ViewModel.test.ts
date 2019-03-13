import { getEntity } from '../../../../store/utils';
import ViewModel from '../Member.ViewModel';
import { CONVERSATION_TYPES as TYPES } from '@/constants';
import { ENTITY_NAME } from '@/store';

jest.mock('../../../../store/utils');

const types = Array.from({ ...TYPES, length: 5 });
const mockGroups = types.map((type, index) => ({
  type: index,
  id: index,
  members: [3331, 3332, 3333, 3334, 3335],
}));

const vmPropsFactory = (id: number) => ({ id });

describe('Member item visible [JPT-45]', () => {
  beforeEach(() => {
    (getEntity as jest.Mock).mockImplementation((entityName, id) => {
      if (entityName !== ENTITY_NAME.GROUP) return {};

      return mockGroups.find(({ id: groupId }) => groupId === id) || {};
    });
  });

  it('should be show when type is team', () => {
    const vm = new ViewModel(vmPropsFactory(TYPES.TEAM));

    expect(vm.showMembersCount).toBeTruthy();
  });

  it('should be show when type is group', () => {
    const vm = new ViewModel(vmPropsFactory(TYPES.NORMAL_GROUP));

    expect(vm.showMembersCount).toBeTruthy();
  });

  it('should be show when type is me', () => {
    const vm = new ViewModel(vmPropsFactory(TYPES.ME));

    expect(vm.showMembersCount).toBeFalsy();
  });

  it('should be show when type is sms', () => {
    const vm = new ViewModel(vmPropsFactory(TYPES.SMS));

    expect(vm.showMembersCount).toBeFalsy();
  });

  it('should be show when type is one to one', () => {
    const vm = new ViewModel(vmPropsFactory(TYPES.NORMAL_ONE_TO_ONE));

    expect(vm.showMembersCount).toBeFalsy();
  });
});

describe('Members count', () => {
  const group = mockGroups[TYPES.TEAM];
  const vm = new ViewModel(vmPropsFactory(TYPES.TEAM));

  it('should be equal when group members provided [JPT-1361]', () => {
    expect(vm.membersCount === group.members.length).toBeTruthy();
  });

  it('should be sync when the group/team member count change [JPT-1367]', () => {
    group.members = group.members.filter(id => id !== 3331);

    expect(vm.membersCount === group.members.length).toBeTruthy();
  });
});
