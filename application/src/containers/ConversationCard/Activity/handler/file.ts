/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:49
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../types';

export default function ({
  ids,
  itemData,
}: {
  ids: number[];
  itemData: { version_map: { [key: number]: number } };
}) {
  const version = itemData.version_map[ids[0]];
  const action =
    ids.length === 1 && version !== 1 ? ACTION.UPLOADED : ACTION.SHARED;
  return {
    action,
    quantifier: ids.length === 1 ? version : ids.length,
  };
}
