/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */

import { TaskItem } from '@/store/models/Items';

type Props = {
  ids: number[];
};

type ViewProps = {
  ids: number[];
  task: TaskItem;
};

export { Props, ViewProps };
