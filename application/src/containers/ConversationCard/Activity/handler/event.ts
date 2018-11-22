/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:46
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../types';

export default function ({
  activityData,
}: {
  activityData?: { [key: string]: any };
}) {
  const action = activityData ? ACTION.UPDATED : ACTION.CREATED;
  return {
    action,
  };
}
