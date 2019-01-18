/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-17 09:44:03
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseDao } from '../../dao';
import { JSdkError } from '../../error/sdk/JSdkError';
class ControllerUtils {
  static getEntityNotificationKey<T>(dao: BaseDao<T>) {
    if (dao) {
      const modelName = dao.modelName.toUpperCase();
      const eventKey: string = `ENTITY.${modelName}`;
      return eventKey;
    }
    throw new JSdkError(
      'ControllerUtils',
      'getEntityNotificationKey error without invalid dao',
    );
  }
}

export { ControllerUtils };
