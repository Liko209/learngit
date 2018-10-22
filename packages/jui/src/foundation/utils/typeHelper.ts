/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-27 10:35:15
 * Copyright © RingCentral. All rights reserved.
 */
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export { Omit };
