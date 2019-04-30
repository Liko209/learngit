/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { BookmarkView } from './Bookmark.View';
import { BookmarkViewModel } from './Bookmark.ViewModel';
import { BookmarkProps } from './types';

const Bookmark = buildContainer<BookmarkProps>({
  View: BookmarkView,
  ViewModel: BookmarkViewModel,
});

export { Bookmark };
