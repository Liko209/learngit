/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 13:43:00
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { PostListPageView } from './PostListPage.View';
import { PostListPageViewModel } from './PostListPage.ViewModel';
import { PostListPageProps } from './types';

const PostListPage = buildContainer<PostListPageProps>({
  View: PostListPageView,
  ViewModel: PostListPageViewModel,
});

export { PostListPage };
