import { Profile } from '../../entity';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';

class MockEntitySourceController implements IEntitySourceController<Profile> {
  getEntityLocally(id: number): Promise<Profile | null> {
    throw new Error('Method not implemented.');
  }
  getEntitiesLocally(
    ids: number[],
    includeDeactivated: boolean,
  ): Promise<Profile[]> {
    throw new Error('Method not implemented.');
  }
  getEntityNotificationKey(): string {
    throw new Error('Method not implemented.');
  }
  put(item: Profile | Profile[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  bulkPut(array: Profile[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  clear(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(key: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  bulkDelete(keys: number[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  update(item: Partial<Profile> | Partial<Profile>[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  bulkUpdate(array: Partial<Profile>[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  batchGet(ids: number[], order?: boolean | undefined): Promise<Profile[]> {
    throw new Error('Method not implemented.');
  }
  getAll(): Promise<Profile[]> {
    throw new Error('Method not implemented.');
  }
  getTotalCount(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getEntityName(): string {
    throw new Error('Method not implemented.');
  }
  get(key: number): Promise<Profile | null> {
    throw new Error('Method not implemented.');
  }
}

export { MockEntitySourceController };
