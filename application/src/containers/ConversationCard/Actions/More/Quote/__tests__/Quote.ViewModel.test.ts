/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-10 16:17:36
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { QuoteViewModel } from '../Quote.ViewModel';

let ViewModel: QuoteViewModel;

describe('QuoteVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    ViewModel = new QuoteViewModel();
  });

  describe('quote()', () => {
    it('should call updateDraft with creator name with correct format. [JPT-447]', () => {
      const mockPost = {
        text: '',
      };
      (getEntity as jest.Mock).mockReturnValue(mockPost);
      ViewModel.quote();
      expect(ViewModel.updateDraft).toBeCalledWith(ViewModel.quoteText);
    });
    it('should call updateDraft with creator name with @poster name. [JPT-454]', () => {});
  });

  describe('updateDraft()', () => {
    it('should call groupService updateGroupDraft with formatting quote.', () => {});
  });
});
