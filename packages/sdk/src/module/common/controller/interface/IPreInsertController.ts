/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-16 09:52:10
 * Copyright © RingCentral. All rights reserved.
 */
import { ExtendedBaseModel } from '../../../models';
import { PROGRESS_STATUS } from '../../../progress';

interface IPreInsertController<
  T extends ExtendedBaseModel = ExtendedBaseModel
> {
  insert(entity: T): Promise<void>;
  delete(entity: T): void;
  update(entity: T): Promise<void>;
  bulkDelete(entities: T[]): Promise<void>;
  updateStatus(entity: T, status: PROGRESS_STATUS): void;
  isInPreInsert(preInsertId: string): boolean;
  getPreInsertId(uniqueId: string): number;
  getAll(): { uniqueIds: string[]; ids: number[] };
}

export { IPreInsertController };
