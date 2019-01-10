/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-04 10:43:32
 * Copyright © RingCentral. All rights reserved.
 */

function isNotEmptyString(data: any): boolean {
  return typeof data === 'string' && data.length > 0;
}

export { isNotEmptyString };
