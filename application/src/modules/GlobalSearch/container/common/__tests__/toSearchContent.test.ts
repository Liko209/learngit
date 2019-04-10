/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-10 19:56:19
 * Copyright © RingCentral. All rights reserved.
 */
import { container, Jupiter } from 'framework';
import { getGlobalValue } from '@/store/utils';
jest.mock('@/store/utils');

import { toSearchContent } from '../toSearchContent';
import { config } from '../../../module.config';
import { GlobalSearchStore } from '../../../store';
import { SEARCH_SCOPE, SEARCH_VIEW, TAB_TYPE } from '../../../types';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('toSearchContent()', () => {
  let globalSearchStore: GlobalSearchStore;

  beforeEach(() => {
    container.snapshot();
    globalSearchStore = container.get(GlobalSearchStore);
  });

  afterEach(() => {
    container.restore();
  });
  it('if not in this conversation should be switch full search and scope is GLOBAL', () => {
    toSearchContent(false);
    expect(globalSearchStore.groupId).toBeUndefined();
    expect(globalSearchStore.searchScope).toBe(SEARCH_SCOPE.GLOBAL);
    expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
    expect(globalSearchStore.currentTab).toBe(TAB_TYPE.CONTENT);
  });

  it('if in this conversation should be switch full search and scope is CONVERSATION', () => {
    const conversationId = 1;

    (getGlobalValue as jest.Mock).mockReturnValue(conversationId);
    toSearchContent(true);
    expect(globalSearchStore.groupId).toBe(conversationId);
    expect(globalSearchStore.searchScope).toBe(SEARCH_SCOPE.CONVERSATION);
    expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
    expect(globalSearchStore.currentTab).toBe(TAB_TYPE.CONTENT);
  });
  it('if in this conversation and has group id should be switch full search and scope is CONVERSATION and set group id', () => {
    const conversationId = 1;

    (getGlobalValue as jest.Mock).mockReturnValue(conversationId);
    toSearchContent(true, 2);
    expect(globalSearchStore.groupId).toBe(2);
    expect(globalSearchStore.searchScope).toBe(SEARCH_SCOPE.CONVERSATION);
    expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
    expect(globalSearchStore.currentTab).toBe(TAB_TYPE.CONTENT);
  });
});
