/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { RIGHT_RAIL_ITEM_TYPE } from 'sdk/module/constants';

type Props = {
  groupId: number;
  type: RIGHT_RAIL_ITEM_TYPE;
};

type ViewProps = {
  ids: number[];
  totalCount: number;
  fetchNextPageItems: () => void;
};

export { Props, ViewProps };
