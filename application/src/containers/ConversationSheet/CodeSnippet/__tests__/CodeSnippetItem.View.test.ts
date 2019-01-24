/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-21 13:01:55
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { CodeSnippetView } from '../CodeSnippetItem.View';
import copy from 'copy-to-clipboard';

jest.mock('copy-to-clipboard');

describe('CodeSnippetItem.View', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCopy()', () => {
    const token = Date.now().toString();
    const props = {
      postItem: {
        title: '',
        body: token,
        mode: '',
        mimeType: '',
        wrapLines: false,
      },
    };
    it('should call copy when called', () => {
      const codeSnippet = new CodeSnippetView(props);
      codeSnippet.handleCopy();
      expect(copy).toBeCalledWith(token);
    });
  });
});
