/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { LogEntity } from 'foundation/log';

type PersistentLogEntity = {
  id: number;
  logs: LogEntity[];
  userId?: number;
  email?: string;
  clientId?: number;
  sessionId: string;
  startTime: number;
  endTime: number;
  size: number;
};

interface ILogPersistent {
  put: (item: PersistentLogEntity) => Promise<void>;
  bulkPut: (array: PersistentLogEntity[]) => Promise<void>;
  get: (key: number) => Promise<PersistentLogEntity | null>;
  getAll: (limit?: number) => Promise<PersistentLogEntity[] | null>;
  delete: (item: PersistentLogEntity) => Promise<void>;
  bulkDelete: (array: PersistentLogEntity[]) => Promise<void>;
  count: () => Promise<number>;
}

export { PersistentLogEntity, ILogPersistent };
