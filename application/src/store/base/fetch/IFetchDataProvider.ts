/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-06 19:34:00
 * Copyright © RingCentral. All rights reserved.
 */

import { FetchDataDirection } from '../constants';

export default interface IFetchDataProvider<T> {
  fetchData(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: T | null,
  ): Promise<T[]>;
}
