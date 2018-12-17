/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import { AvatarActionsViewModel } from '../AvatarActions.ViewModel';
import { AuthService } from 'sdk/service';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

let ViewModel: AvatarActionsViewModel;

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
    it('should call authService logout() [JPT-70]', async () => {
      const authService = {
        logout: jest.fn(),
      };
      jest.spyOn(AuthService, 'getInstance').mockReturnValue(authService);

      await ViewModel.handleSignOut();
      expect(authService.logout).toHaveBeenCalled();
    });
  });
});
