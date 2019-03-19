/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-17 09:44:03
 * Copyright © RingCentral. All rights reserved.
 */
import { IDao } from '../../framework/dao';
import { JSdkError } from '../../error/sdk/JSdkError';
import { SYNC_SOURCE } from '../../module/sync/types';
class ControllerUtils {
  static getEntityNotificationKey<T>(dao: IDao<T>) {
    if (dao) {
      const modelName = dao.getEntityName().toUpperCase();
      const eventKey: string = `ENTITY.${modelName}`;
      return eventKey;
    }
    throw new JSdkError(
      'ControllerUtils',
      'getEntityNotificationKey error without invalid dao',
    );
  }

  static shouldEmitNotification(source?: SYNC_SOURCE) {
    return source !== SYNC_SOURCE.REMAINING;
  }
}

export { ControllerUtils };
