/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:50:19
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '@/store/models/Group';
import { Props, BaseViewProps } from '../types';

type ViewProps = {
  group: GroupModel;
  onClick: (
    group: GroupModel,
  ) => (event: React.MouseEvent<HTMLElement>) => void;
} & BaseViewProps;

export { Props, ViewProps, GroupModel };
