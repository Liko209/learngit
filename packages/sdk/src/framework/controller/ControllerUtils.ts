/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-17 09:44:03
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseDao } from '../../dao';
class ControllerUtils {
  static getEntityNotificationKey<T>(dao: BaseDao<T>) {
    if (dao) {
      const modelName = dao.modelName.toUpperCase();
      const eventKey: string = `ENTITY.${modelName}`;
      return eventKey;
    }
    throw new Error('getEntityNotificationKey error without invalid dao');
  }
}

export { ControllerUtils };
