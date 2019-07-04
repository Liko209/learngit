/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';
import FileItemModel from '@/store/models/FileItem';
import GroupModel from '@/store/models/Group';
import { FileActionProps } from '../common/types';

export type FileNameEditActionProps = FileActionProps;

export type FileNameEditActionViewProps = FileNameEditActionProps & {
  canEditFileName: boolean;
  newFileName: string;
  updateNewFileName: (newFileName: string) => void;
  item: FileItemModel;
  group: GroupModel;
  fileNameRemoveSuffix: string;
  isLoading: boolean;
  handleEditFileName: () => boolean;
} & WithTranslation;
