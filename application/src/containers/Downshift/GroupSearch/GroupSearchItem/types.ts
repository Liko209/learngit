/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-09 09:53:57
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '@/store/models/Group';

type Props = {
  itemId: number;
};

type ViewProps = Props & {
  group: GroupModel;
  isHighlighted: boolean;
  avatar?: React.ReactElement;
  size?: 'medium' | 'large';
};

export { Props, ViewProps };
