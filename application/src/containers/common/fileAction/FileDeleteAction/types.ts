/*
 * @Author: wayne.zhou
 * @Date: 2019-05-29 13:05:26
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';

export type FileDeleteActionProps = {
  fileId: number;
  postId?: number;
};

export type FileDeleteActionViewProps = {
  canDelete: boolean;
  fileName: string;
  handleDeleteFile: Function;
} & WithTranslation;
