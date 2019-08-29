/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { ProfileMiniCardPersonViewModel } from '../Person.ViewModel';

jest.mock('@/store/utils');
jest.mock('emoji-mart', () => ({
  getEmojiDataFromNative: () => ({
    colons: ':rainbow:',
  }),
}));
const mockData = {
  userDisplayName: 'Person Name',
  awayStatus: 'online',
  title: 'Developer',
};

const props = {
  id: 1,
};
let vm: ProfileMiniCardPersonViewModel;

describe('ProfileMiniCardPersonViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ProfileMiniCardPersonViewModel(props);
  });

  describe('id', () => {
    it('should be get person id when the component is instantiated', () => {
      expect(vm.id).toEqual(props.id);
    });
  });

  describe('person', () => {
    it('should be get person entity when invoke class instance property person [JPT-405]', () => {
      expect(vm.person).toEqual(mockData);
    });

    it('should be get changed person entity when change person entity data [JPT-405]', () => {
      mockData.userDisplayName = 'Person Name 2';
      mockData.awayStatus = 'offline';
      mockData.title = 'PM';
      expect(vm.person).toEqual(mockData);
    });
  });
  describe('emoji', () => {
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
      expect(vm.statusPlainText).toBe('  inthemeeting');
    });
  })
});
