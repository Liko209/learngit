/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:58
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../types';

export default function ({
  activityData,
}: {
  activityData?: { [key: string]: any };
}) {
  let action = ACTION.CREATED;
  if (activityData) {
    const { key, value, old_value } = activityData;
    switch (key) {
      case 'assigned_to_ids':
        action = old_value.length ? ACTION.REASSIGNED : ACTION.ASSIGNED;
        break;
      case 'complete_boolean':
        action = value ? ACTION.COMPLETED : ACTION.INCOMPLETE;
        break;
    }
  }
  return {
    action,
  };
}
