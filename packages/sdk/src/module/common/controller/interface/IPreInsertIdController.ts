/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-18 11:07:38
 * Copyright © RingCentral. All rights reserved.
 */

interface IPreInsertIdController {
  isInPreInsert(uniqueId: string): boolean;
  insert(uniqueId: string, preInsertId: number): Promise<void>;
  delete(uniqueId: string): Promise<void>;
  bulkDelete(uniqueId: string[]): Promise<void>;
  getAll(): { uniqueIds: string[]; ids: number[] };
}
export { IPreInsertIdController };
