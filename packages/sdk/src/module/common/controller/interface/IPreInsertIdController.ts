/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-18 11:07:38
 * Copyright © RingCentral. All rights reserved.
 */
interface IPreInsertIdController {
  isInPreInsert(version: number): boolean;
  insert(version: number): Promise<void>;
  delete(version: number): Promise<void>;
  bulkDelete(versions: number[]): Promise<void>;
  getAll(): {
    [version: number]: number;
  };
}
export { IPreInsertIdController };
