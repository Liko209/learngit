/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-06-30 16:24:39
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';
import { FileActionProps } from '../common/types';

export type ViewInPostActionProps = FileActionProps & {
  groupId: number;
  asyncOperationDecorator?: FunctionDecorator;
};
export type ViewInPostActionViewProps = {
  viewInPost: Function;
} & ViewInPostActionProps &
WithTranslation;
