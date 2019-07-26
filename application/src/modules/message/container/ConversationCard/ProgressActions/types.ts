/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-09 14:08:18
 * Copyright © RingCentral. All rights reserved.
 */

import PostModel from '@/store/models/Post';
import { PROGRESS_STATUS } from 'sdk/module/progress';

type ProgressActionsProps = {
  id: number; // post id
  isEditMode: boolean;
};

type ProgressActionsViewProps = {
  id: number;
  inEditProcess: boolean;
  post: PostModel;
  resend: Function;
  edit: Function;
  deletePost: Function;
  postStatus?: PROGRESS_STATUS;
};

export { ProgressActionsProps, ProgressActionsViewProps };
