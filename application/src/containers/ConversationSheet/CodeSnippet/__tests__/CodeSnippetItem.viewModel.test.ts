/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-20 22:31:07
 * Copyright © RingCentral. All rights reserved.
 */

import * as utils from '@/store/utils';
import { CodeSnippetViewModel } from '../CodeSnippetItem.viewModel';

describe('CodeSnippetItemViewModel', () => {
  const props = {
    ids: [1, 2],
  };

  it('should compute _id correctly', () => {
    const codeSnippetViewModel = new CodeSnippetViewModel(props);
    expect(codeSnippetViewModel._id).toEqual(props.ids[0]);
  });

  it('should compute postItem correctly', () => {
    const token = 'asdf';
    jest.spyOn(utils, 'getEntity').mockReturnValue(token);
    const codeSnippetViewModel = new CodeSnippetViewModel(props);
    expect(codeSnippetViewModel.postItem).toEqual(token);
  });
});
