/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-17 13:34:29
 * Copyright © RingCentral. All rights reserved.
 */

import { Progress } from '../entity';
interface IProgressService {
  addProgress(id: number, status: Progress): void;

  updateProgress(id: number, status: Progress): void;

  deleteProgress(id: number): void;

  getByIdSync(id: number): Progress | null;
}

export { IProgressService };
