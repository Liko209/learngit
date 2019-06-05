/*
 * @Author: ken.li
 * @Date: 2019-06-05 11:10:11
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { CONVERSATION_TYPES } from '@/constants';
import { ColonEmojiViewModel } from '../ColonEmoji.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('@/store/utils');
jest.mock('sdk/module/search');

let colonEmojiViewModel: ColonEmojiViewModel;
beforeEach(() => {
  let mockSearchService: any;
  mockSearchService = {
    doFuzzySearchPersons: jest.fn(),
  };

  ServiceLoader.getInstance = jest.fn().mockReturnValue(mockSearchService);

  colonEmojiViewModel = new ColonEmojiViewModel({ id: 1 });
});
describe('colonEmojiViewModel', () => {
  it('should be initial state when start', () => {
    expect(colonEmojiViewModel.open).toBe(false);
    expect(colonEmojiViewModel.currentIndex).toBe(0);
    expect(colonEmojiViewModel.members).toEqual([]);
    expect(colonEmojiViewModel.searchTerm).toBe(undefined);
  });
});
