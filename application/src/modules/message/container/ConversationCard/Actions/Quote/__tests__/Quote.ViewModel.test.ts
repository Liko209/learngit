/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-10 16:17:36
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { QuoteViewModel } from '../Quote.ViewModel';

jest.mock('@/store/utils');

let ViewModel: QuoteViewModel;

const mockExpectQuoteHead =
  // tslint:disable-next-line
  "<span class='mention' data-id='1' data-name='Shining' data-denotation-char='@'><span contenteditable='false'><span class='ql-mention-denotation-char'>@</span>Shining</span></span> wrote:<br />";

const mockOriginalText = (text: string) => {
  (getEntity as jest.Mock).mockImplementation((type: string) => {
    if (type === ENTITY_NAME.POST) {
      return { text };
    }
    if (type === ENTITY_NAME.PERSON) {
      return { userDisplayName: 'Shining', id: 1 };
    }
    return null;
  });
  ViewModel = new QuoteViewModel({ id: 1 });
};

describe('QuoteVM', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('quote()', () => {
    it('should quoteText and quoteHead with correct quote format. [JPT-447]', () => {
      mockOriginalText('test\n');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe('> test<br/><br/><br/><br/>');
      expect(ViewModel.getQuoteHead()).toBe(mockExpectQuoteHead);
    });
  });
  describe('getQuoteText()', () => {
    it('should format with >>>\n', () => {
      mockOriginalText('>>>\n');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe('> >>><br/><br/><br/><br/>');
    });
    it('should format with >\n', () => {
      mockOriginalText('>\n');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe('> ><br/><br/><br/><br/>');
    });
    it('should format with \n\n\n', () => {
      mockOriginalText('\n\n\n');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe(
        '> <br/>> <br/>> <br/><br/><br/><br/>',
      );
    });
    it('should format with \n\n>', () => {
      mockOriginalText('\n\n>');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe(
        '> <br/>> <br/>> ><br/><br/><br/><br/>',
      );
    });
    it('should format with 900900\n', () => {
      mockOriginalText('900900\n');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe('> 900900<br/><br/><br/><br/>');
    });
    it('should format with >>\n', () => {
      mockOriginalText('>>\n');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe('> >><br/><br/><br/><br/>');
    });
    it('should format with \n>\n>\n>', () => {
      mockOriginalText('\n>\n>\n>');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe(
        '> <br/>> ><br/>> ><br/><br/><br/><br/>',
      );
    });
    it('should format with \n   >\n  >\n>', () => {
      mockOriginalText('\n   >\n  >\n>');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe(
        '> <br/>>    ><br/>>   ><br/>> ><br/><br/><br/><br/>',
      );
    });
    it('should format with \n   \n  >\n>', () => {
      mockOriginalText('\n   \n  >\n>');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe(
        '> <br/>>    <br/>>   ><br/>> ><br/><br/><br/><br/>',
      );
    });
    it('should format without end with \n', () => {
      mockOriginalText('eee');

      ViewModel.quote();
      expect(ViewModel.getQuoteText()).toBe('> eee<br/><br/><br/><br/>');
    });
  });
});
