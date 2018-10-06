/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:09:41
 * Copyright © RingCentral. All rights reserved.
 */
export default interface ISortableModel<T = any> {
  id: number;
  sortValue: number;
  data?: T;
}
