/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { AvatarActionsViewModel } from '../AvatarActions.ViewModel';

let ViewModel: AvatarActionsViewModel;
jest.mock('@/store/utils');
jest.unmock('@/common/emojiHelpers/map/mapUnicode');
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

describe('AvatarActionsVM', () => {
  beforeAll(() => {
    ViewModel = new AvatarActionsViewModel();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('awayStatus()', () => {
    it('should return status start with blank if has emoji', () => {
      (getEntity as jest.Mock).mockReturnValue({
        awayStatus: '🌻 in the meeting',
      });
      expect(ViewModel.awayStatus).toBe('   in the meeting');
    });
    it('should return emoji if awayStatus has emoji', () => {
      (getEntity as jest.Mock).mockReturnValue({
        awayStatus: '🌻 in the meeting',
      });
      expect(ViewModel.colons).toBe('🌻');
    });
  });
  describe('handleAboutPage()', () => {
    const globalStore = storeManager.getGlobalStore();
    it('should globalStore set isShowDialog [JPT-179]', () => {
      ViewModel.toggleAboutPage();
      expect(globalStore.get(GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG)).toBe(true);
    });
    it('should set electron info to globalStore', () => {
      jest.resetAllMocks();
      jest.spyOn(globalStore, 'set');
      ViewModel.toggleAboutPage('a', 'b');
      expect(globalStore.set).toHaveBeenCalledTimes(3);
      expect(globalStore.get(GLOBAL_KEYS.ELECTRON_APP_VERSION)).toEqual('a');
      expect(globalStore.get(GLOBAL_KEYS.ELECTRON_VERSION)).toEqual('b');
    });
    it('should not set empty electron info to globalStore', () => {
      jest.resetAllMocks();
      jest.spyOn(globalStore, 'set');
      ViewModel.toggleAboutPage();
      expect(globalStore.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSignOut()', () => {
    it('should call AccountService logout() [JPT-70]', async (done: jest.DoneCallback) => {
      const accountService = {
        logout: jest.fn(),
      };
      ServiceLoader.getInstance = jest.fn().mockReturnValue(accountService);

      await ViewModel.handleSignOut();
      expect(accountService.logout).toHaveBeenCalled();
      done();
    });
  });
});
