/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-18 11:07:38
 * Copyright © RingCentral. All rights reserved.
 */
interface IPreInsertIdController {
  isInPreInsert(preInsertId: string): boolean;
  insert(preInsertId: string): Promise<void>;
  delete(preInsertId: string): Promise<void>;
  bulkDelete(preInsertIds: string[]): Promise<void>;
  getAll(): string[];
}
export { IPreInsertIdController };
