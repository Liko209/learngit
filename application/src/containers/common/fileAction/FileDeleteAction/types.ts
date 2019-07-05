/*
 * @Author: wayne.zhou
 * @Date: 2019-05-29 13:05:26
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';
import { FileActionProps } from '../common/types';

export type FileDeleteActionProps = FileActionProps & {
  beforeDelete?: () => void;
};

export type FileDeleteActionViewProps = {
  canDelete: boolean;
  fileName: string;
  handleDeleteFile: Function;
} & FileDeleteActionProps &
  WithTranslation;
