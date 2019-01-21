/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-16 17:32:18
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { CodeSnippetView } from './CodeSnippetItem.View';
import { CodeSnippetViewModel } from './CodeSnippetItem.ViewModel';

const CodeSnippet = buildContainer({
  View: CodeSnippetView,
  ViewModel: CodeSnippetViewModel,
});

export { CodeSnippet };
