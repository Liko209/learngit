/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-13 15:39:41
 * Copyright © RingCentral. All rights reserved.
 */
import { Profile } from '../entity/Profile';
function extractHiddenGroupIds(profile: Profile): number[] {
  const clone = Object.assign({}, profile);
  const result: number[] = [];
  Object.keys(clone).forEach((key: string) => {
    if (clone[key] === true) {
      const m = key.match(new RegExp(`(${'hide_group'})_(\\d+)`));
      if (m) {
        result.push(Number(m[2]));
      }
    }
  });
  return result;
}

export { extractHiddenGroupIds };
