/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 19:30:05
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '@/store/utils';
import { HeaderViewModel } from '../Header.ViewModel';
jest.mock('@/store/utils');
const vm = new HeaderViewModel();

describe('ConversationPageHeaderViewModel', () => {
  beforeEach(() => {
    jest.resetModules();
    vm.onReceiveProps({ id: 1 });
  });
  it('customStatus should be null if isTeam', () => {
    (getEntity as jest.Mock).mockImplementation((type: string) => {
      if (type === 'group') {
        return { isTeam: true };
      }
      return null;
    });
    expect(vm.customStatus).toBe(null);
  });
  it('customStatus should be null if members is undefined', () => {
    (getEntity as jest.Mock).mockImplementation((type: string) => {
      if (type === 'group') {
        return { members: undefined };
      }
      return null;
    });
    expect(vm.customStatus).toBe(null);
  });

  it('customStatus should be null if has more than 2 members', () => {
    (getEntity as jest.Mock).mockImplementation((type: string) => {
      if (type === 'group') {
        return { members: [1, 2, 3] };
      }
      return null;
    });

    expect(vm.customStatus).toBe(null);
  });

  it('customStatus should be current user custom status if has one member', () => {
    (getEntity as jest.Mock).mockImplementation((type: string) => {
      if (type === 'group') {
        return { members: [1] };
      }
      if (type === 'person') {
        return {
          awayStatus: 'in the meeting',
        };
      }
      return null;
    });
    (getGlobalValue as jest.Mock).mockReturnValue(1);
    expect(vm.customStatus).toBe('in the meeting');
  });

  it('customStatus should be null if has one member and current user has no custom status', () => {
    (getEntity as jest.Mock).mockImplementation((type: string) => {
      if (type === 'group') {
        return { members: [1] };
      }
      if (type === 'person') {
        return {};
      }
      return null;
    });
    (getGlobalValue as jest.Mock).mockReturnValue(1);
    expect(vm.customStatus).toBe(null);
  });

  it('customStatus should be other members custom status if has two members', () => {
    (getEntity as jest.Mock).mockImplementation((type: string, id: number) => {
      if (type === 'group') {
        return { members: [1, 2] };
      }
      if (type === 'person') {
        if (id === 2) {
          return {
            awayStatus: 'in the meeting',
          };
        }
        return {};
      }
      return null;
    });
    (getGlobalValue as jest.Mock).mockReturnValue(1);
    expect(vm.customStatus).toBe('in the meeting');
  });

  it('customStatus should be null if has two members and other members has no custom status', () => {
    (getEntity as jest.Mock).mockImplementation((type: string, id: number) => {
      if (type === 'group') {
        return { members: [1, 2] };
      }
      if (type === 'person') {
        if (id === 2) {
          return {};
        }
        return {};
      }
      return null;
    });
    (getGlobalValue as jest.Mock).mockReturnValue(1);
    expect(vm.customStatus).toBe(null);
  });
});
