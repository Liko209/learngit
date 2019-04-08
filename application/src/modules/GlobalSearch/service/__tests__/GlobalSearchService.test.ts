/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-03 12:51:29
 * Copyright © RingCentral. All rights reserved.
 */
import { container, Jupiter } from 'framework';
import { GlobalSearchStore } from '../../store/GlobalSearchStore';
import { GlobalSearchService } from '../GlobalSearchService';
import { config } from '../../module.config';

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
  it('openGlobalSearch()', () => {
    globalSearchService.openGlobalSearch();
    expect(globalSearchStore.open).toBeTruthy();
  });
  it('closeGlobalSearch', () => {
    globalSearchService.closeGlobalSearch();
    expect(globalSearchStore.open).toBeFalsy();
  });
});
