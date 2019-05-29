/*
 * @Author: wayne.zhou
 * @Date: 2019-05-29 13:05:26
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';

export type FileDeleteOptionProps = {
  fileId: number;
  postId?: number;
};

export type FileDeleteOptionViewProps = {
  canDelete: boolean;
  fileName: string;
  handleDeleteFile: Function;
} & WithTranslation;
