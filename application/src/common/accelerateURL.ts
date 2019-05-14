/*
 * @Author: isaac.liu
 * @Date: 2019-05-09 14:07:54
 * Copyright © RingCentral. All rights reserved.
 */

const regExp = /s3[\w\d-]*\.amazonaws\.com/;

const accelerateURL = (url?: string): string | undefined =>
  url ? url.replace(regExp, 's3-accelerate.amazonaws.com') : url;

export { accelerateURL };
