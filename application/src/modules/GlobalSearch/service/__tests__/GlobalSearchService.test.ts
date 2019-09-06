/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-03 12:51:29
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { GlobalSearchStore } from '../../store/GlobalSearchStore';
import { GlobalSearchService } from '../GlobalSearchService';
import { config } from '../../module.config';
import { SEARCH_VIEW } from '../../types';
import { Dialer } from '../../../telephony/container';
import { isDialogOpen } from '@/containers/Dialog/utils';

jest.mock('@/containers/Dialog/utils');
// jest.mock('../../store/GlobalSearchStore');
const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('GlobalSearchService', () => {
  let globalSearchService: GlobalSearchService;
  let globalSearchStore: GlobalSearchStore;
  beforeEach(() => {
    container.snapshot();
    globalSearchService = jupiter.get(GlobalSearchService);
    globalSearchStore = jupiter.get(GlobalSearchStore);
  });
  afterEach(() => {
    container.restore();
  });
  describe('openGlobalSearch()', () => {
    it('if search key is empty should be open recent search', () => {
      globalSearchStore.setSearchKey('');
      globalSearchService.openGlobalSearch();
      expect(globalSearchStore.open).toBeTruthy();
      expect(globalSearchStore.needFocus).toBeTruthy();
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.RECENT_SEARCH);
    });
    it('if search key is not empty should be open instant search', () => {
      globalSearchStore.setSearchKey('a');
      globalSearchService.openGlobalSearch();
      expect(globalSearchStore.open).toBeTruthy();
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.INSTANT_SEARCH);
    });

    it('should return true when there is dialog open and globalSearch is not opened', () => {
      (isDialogOpen as jest.Mock) = jest.fn(() => true);
      globalSearchStore.open = false;
      expect(globalSearchService.openGlobalSearch()).toBe(true);
    });

    it('should return false when there is dialog open and globalSearch is opened', () => {
      (isDialogOpen as jest.Mock) = jest.fn(() => true);
      globalSearchStore.open = true;
      expect(globalSearchService.openGlobalSearch()).toBe(false);
    });

    it('should return false when there is no dialog open', () => {
      (isDialogOpen as jest.Mock) = jest.fn(() => false);
      globalSearchStore.open = false;
      expect(globalSearchService.openGlobalSearch()).toBe(false);
    });
  });
  describe('closeGlobalSearch()', () => {
    it('global search store open should be false', () => {
      globalSearchService.closeGlobalSearch();
      expect(globalSearchStore.open).toBeFalsy();
      expect(globalSearchStore.needFocus).toBeFalsy();
    });
  });
  describe('registerExtension()', () => {
    it('should call global search store addExtensions()', () => {
      globalSearchService.registerExtension('Dialer', Dialer);
      expect(globalSearchStore.extensions['Dialer'].has(Dialer)).toBeTruthy();
    });
  });
});
