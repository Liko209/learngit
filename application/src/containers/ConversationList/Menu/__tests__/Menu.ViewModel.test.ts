/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-12 14:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import { MenuViewModel } from '../Menu.ViewModel';
import * as utils from '@/store/utils';
import { service } from 'sdk';

jest.mock('sdk/service');
jest.mock('@/store/utils');
jest.mock('sdk/api');

describe('MenuViewModel', () => {
  describe('shouldSkipCloseConfirmation()', () => {
    it('should return falsy for shouldSkipCloseConfirmation as default', () => {
      jest.spyOn(utils, 'getSingleEntity').mockImplementationOnce(() => false);
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

  describe('closable()', () => {
    let groupState: any;
    beforeEach(() => {
      groupState = {
        unreadCount: 0,
        isFavorite: false,
      };
      jest.clearAllMocks();
      jest.spyOn(utils, 'getEntity').mockImplementation(() => groupState);
    });
    it('should closable when conversation is neither unread nor favourite', () => {
      const model = new MenuViewModel();
      expect(model.closable).toBe(true);
    });
    it('should not closable when conversation is both unread and favourite', () => {
      const model = new MenuViewModel();
      groupState.unreadCount = 100;
      groupState.isFavorite = true;
      expect(model.closable).toBe(false);
    });
    it('should not closable when conversation is unread ', () => {
      const model = new MenuViewModel();
      groupState.unreadCount = 100;
      expect(model.closable).toBe(false);
    });
    it('should not closable when conversation is favourite', () => {
      const model = new MenuViewModel();
      groupState.isFavorite = true;
      expect(model.closable).toBe(false);
    });
  });
  describe('favoriteText()', () => {
    let groupState: any;
    beforeEach(() => {
      groupState = {
        unreadCount: 0,
        isFavorite: false,
      };
      jest.clearAllMocks();
      jest.spyOn(utils, 'getEntity').mockImplementation(() => groupState);
    });
    it('should favoriteText correctly when isFavorite=true', () => {
      const model = new MenuViewModel();
      groupState.isFavorite = true;
      expect(model.favoriteText).toBe('people.team.removeFromFavorites');
    });
    it('should favoriteText correctly when isFavorite=false', () => {
      const model = new MenuViewModel();
      groupState.isFavorite = false;
      expect(model.favoriteText).toBe('people.team.favorite');
    });
  });
});
