/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-15 13:13:54
 * Copyright © RingCentral. All rights reserved.
 */
const transform2Map = (entities: any[]): Map<number, any> => {
  const map = new Map();
  entities.forEach((item: any) => {
    map.set(item.id, item);
  });
  return map;
};

export { transform2Map };
