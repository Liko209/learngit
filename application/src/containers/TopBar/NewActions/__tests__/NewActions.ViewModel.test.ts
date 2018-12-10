/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:29:47
 * Copyright © RingCentral. All rights reserved.
 */
import { NewActionsViewModel } from '../NewActions.ViewModel';

let ViewModel: NewActionsViewModel;

describe('NewActionsVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    ViewModel = new NewActionsViewModel();
  });

  describe('updateCreateTeamDialogState()', () => {
    it('should globalStore set isShowCreateTeamDialog [JPT-86]', () => {
      ViewModel.updateCreateTeamDialogState();
      expect(ViewModel.isShowCreateTeamDialog).toBe(true);
    });
  });

  describe('updateNewMessageDialogState()', () => {
    it('should globalStore set isShowNewMessageDialog [JPT-285]', () => {
      ViewModel.updateNewMessageDialogState();
      expect(ViewModel.isShowNewMessageDialog).toBe(true);
    });
  });
});
