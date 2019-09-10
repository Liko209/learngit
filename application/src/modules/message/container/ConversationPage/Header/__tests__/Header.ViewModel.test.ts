/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 19:30:05
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '@/store/utils';
import { CONVERSATION_TYPES } from '@/constants';
import { HeaderViewModel } from '../Header.ViewModel';

jest.mock('@/store/utils');
jest.mock('emoji-mart', () => ({
  getEmojiDataFromNative: () => ({
    colons: ':rainbow:',
  }),
}));
jest.mock('i18next', () => ({
  languages: ['en'],
  services: {
    backendConnector: {
      state: {
        'en|translation': -1,
      },
    },
  },
  isInitialized: true,
  t: (text: string) => text.substring(text.lastIndexOf('.') + 1),
}));

const vm = new HeaderViewModel();

const mockGroup = {
  members: [1, 2],
  displayName: '1234 1234',
  type: CONVERSATION_TYPES.SMS,
};

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
  it('should return emoji when get customStatus', () => {
    (getEntity as jest.Mock).mockReturnValue({
      awayStatus: ':rainbow: in the meeting',
    })
    expect(vm.colonsEmoji).toBe(':rainbow:');
  });
  it('should return status text when get customStatus', () => {
    (getEntity as jest.Mock).mockReturnValue({
      awayStatus: 'in the meeting',
    })
    expect(vm.statusPlainText).toBe('  ');
  });
  describe('title', () => {
    it('conversation types is sms', async () => {
      (getEntity as jest.Mock).mockImplementation(
        (type: string, id: number) => mockGroup,
      );
      expect(await vm.title).toBe(
        `${mockGroup.displayName} (messageTypeNameSMS)`,
      );
    });
    it('conversation types is not sms', async () => {
      (getEntity as jest.Mock).mockImplementation(
        (type: string, id: number) => ({
          ...mockGroup,
          type: CONVERSATION_TYPES.TEAM,
        }),
      );
      expect(await vm.title).toBe(mockGroup.displayName);
    });
  });
});
