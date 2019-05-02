/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import { AvatarActionsViewModel } from '../AvatarActions.ViewModel';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { ServiceLoader } from 'sdk/module/serviceLoader';

let ViewModel: AvatarActionsViewModel;

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
    jest.resetAllMocks();
    ViewModel = new AvatarActionsViewModel();
  });

  describe('handleAboutPage()', () => {
    const globalStore = storeManager.getGlobalStore();
    it('should globalStore set isShowDialog [JPT-179]', () => {
      ViewModel.toggleAboutPage();
      expect(globalStore.get(GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG)).toBe(true);
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
