/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-15 13:13:54
 * Copyright © RingCentral. All rights reserved.
 */
import { IdModel, ModelIdType } from 'sdk/framework/model';

const transform2Map = <
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
>(
  entities: T[],
) => {
  const map: Map<IdType, T> = new Map();
  entities.forEach((item: T) => {
    map.set(item.id, item);
  });
  return map;
};

export { transform2Map };
