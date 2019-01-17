/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:28:15
 * Copyright © RingCentral. All rights reserved.
 */

import LinkItemModel from '@/store/models/LinkItem';

type LinkItemProps = {
  id: number;
};

type LinkItemViewProps = {
  link: LinkItemModel;
  personName: string;
  createdTime: string;
  url: string;
};

export { LinkItemProps, LinkItemViewProps };
