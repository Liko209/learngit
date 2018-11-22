/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:52
 * Copyright © RingCentral. All rights reserved.
 */
import { ACTION } from '../types';

export default function ({ ids }: { ids: number[] }) {
  return {
    action: ACTION.SHARED,
    quantifier: ids.length,
  };
}
