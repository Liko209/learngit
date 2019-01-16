/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-16 09:52:10
 * Copyright © RingCentral. All rights reserved.
 */
import { IdModel } from '../../model';

interface IPreInsertController<T extends IdModel = IdModel> {
  preInsert(entity: T): Promise<void>;
  incomesStatusChange(id: number, success: boolean): void;
}

export { IPreInsertController };
