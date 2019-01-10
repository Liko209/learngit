/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { ITEM_LIST_TYPE } from '../types';

type Props = {
  groupId: number;
  type: ITEM_LIST_TYPE;
};

type ViewProps = {
  ids: number[];
  totalCount: number;
  fetchMore: any;
};

export { Props, ViewProps };
