/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-12 14:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import { MenuViewModel } from '../Menu.ViewModel';
describe('MenuViewModel', () => {
  describe('shouldSkipCloseConfirmation()', () => {
    it('should return falsy for shouldSkipCloseConfirmation as default', () => {
      const model = new MenuViewModel();
      expect(model.shouldSkipCloseConfirmation).toBeFalsy();
    });
  });

  describe('test props', () => {
    it('should test props for view model', () => {
      const props = {
        personId: 1,
        groupId: 2,
        anchorEl: null,
        onClose: () => {},
      };
      const model = new MenuViewModel(props);
      expect(model.personId).toBe(1);
      expect(model.groupId).toBe(2);
      expect(model.onClose).toBeInstanceOf(Function);
      expect(model.anchorEl).toBe(null);
    });
  });

  describe('_group()', () => {
    it('should _group with true', () => {
      const model = new MenuViewModel();
      expect(model.showClose).toBe(true);
    });
  });
});
