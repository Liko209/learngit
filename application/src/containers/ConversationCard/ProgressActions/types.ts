/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-09 14:08:18
 * Copyright © RingCentral. All rights reserved.
 */

import PostModel from '@/store/models/Post';
import { POST_STATUS } from 'sdk/service';

type ProgressActionsProps = {
  id: number; // post id
};

type ProgressActionsViewProps = {
  id: number;
  post: PostModel;
  resend: Function;
  deletePost: Function;
  postStatus?: POST_STATUS;
};

export { ProgressActionsProps, ProgressActionsViewProps };
