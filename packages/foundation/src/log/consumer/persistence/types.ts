import { LogEntity } from '../../types';
type PersistenceLogEntity = {
  id: number;
  logs: LogEntity[];
  userId?: number;
  email?: string;
  clientId?: number;
  sessionId: string;
  startTime: number;
  endTime: number;
  size?: number;
};

interface ILogPersistence {
  init: () => Promise<void>;
  put: (item: PersistenceLogEntity) => Promise<void>;
  bulkPut: (array: PersistenceLogEntity[]) => Promise<void>;
  get: (key: number) => Promise<PersistenceLogEntity | null>;
  getAll: (limit: number) => Promise<PersistenceLogEntity[] | null>;
  delete: (item: PersistenceLogEntity) => Promise<void>;
  bulkDelete: (array: PersistenceLogEntity[]) => Promise<void>;
  count: () => Promise<number>;
}

export {
  PersistenceLogEntity,
  ILogPersistence,
};
