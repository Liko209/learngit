/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-17 09:44:03
 * Copyright © RingCentral. All rights reserved.
 */
import { IDao } from '../../framework/dao';
import { JSdkError } from '../../error/sdk/JSdkError';
import { IdModel, ModelIdType } from '../model';
class ControllerUtils {
  static getEntityNotificationKey<
    T extends IdModel<IdType>,
    IdType extends ModelIdType = number
  >(dao: IDao<T, IdType>) {
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
}

export { ControllerUtils };
