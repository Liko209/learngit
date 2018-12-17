/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-10 16:17:36
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../../store/utils';
import { ENTITY_NAME } from '@/store';
import { QuoteViewModel } from '../Quote.ViewModel';

jest.mock('../../../../../store/utils');

let ViewModel: QuoteViewModel;

describe('QuoteVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  describe('quote()', () => {
    it('should quoteText and quoteHead with correct quote format. [JPT-447]', () => {
      const expectQuoteHead =
        // tslint:disable-next-line
        "<span class='mention' data-id='1' data-name='Shining' data-denotation-char='@'><span contenteditable='false'><span class='ql-mention-denotation-char'>@</span>Shining</span></span> wrote:<br />";
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.POST) {
          return { text: 'test' };
        }
        if (type === ENTITY_NAME.PERSON) {
          return { userDisplayName: 'Shining', id: 1 };
        }
        return null;
      });
      ViewModel = new QuoteViewModel({ id: 1 });

      ViewModel.quote();
      expect(ViewModel._quoteText).toBe('> test<br/><br/><br/>');
      expect(ViewModel._quoteHead).toBe(expectQuoteHead);
    });
  });
});
