import { IEntitySourceController } from '../../controller/interface/IEntitySourceController';
import { EntityCacheController } from '../../controller/impl/EntityCacheController';
import { IdModel } from '../../model';
import { IRequestController } from 'sdk/framework/controller/interface/IRequestController';

export class TestEntitySourceController<T extends IdModel = IdModel>
  implements IEntitySourceController<T> {
  getRequestController(): IRequestController<T, number> | null {
    throw new Error('Method not implemented.');
  }
  saveToMemory?: ((entities: T[]) => void) | undefined;
  entityCache: EntityCacheController<T>;

  constructor() {
    this.entityCache = new EntityCacheController();
  }

  get = jest
    .fn()
    .mockImplementation(async (id: number) => await this.entityCache.get(id));

  getEntityLocally = jest
    .fn()
    .mockImplementation(async (id: number) => await this.entityCache.get(id));

  getEntitiesLocally = jest
    .fn()
    .mockImplementation(
      async (ids: number[]) =>
        await this.entityCache.getEntities((entity: T) =>
          ids.includes(entity.id),
        ),
    );

  getEntityNotificationKey = jest
    .fn()
    .mockImplementation(() => this.entityCache.getEntityName());

  getEntities = jest
    .fn()
    .mockImplementation(
      async (filterFunc?: ((entity: T) => boolean) | undefined) =>
        await this.entityCache.getEntities(filterFunc),
    );

  getAll = jest
    .fn()
    .mockImplementation(async () => await this.entityCache.getAll());

  getTotalCount = jest
    .fn()
    .mockImplementation(async () => await this.entityCache.getTotalCount());

  getEntityName = jest
    .fn()
    .mockImplementation(() => this.entityCache.getEntityName());

  put = jest.fn().mockImplementation(async (item: T) => {
    await this.entityCache.put(item);
  });

  bulkPut = jest.fn().mockImplementation(async (array: T[]) => {
    // this.locals = this.locals.concat(array);
    await this.entityCache.bulkPut(array);
  });

  clear = jest.fn().mockImplementation(() => {
    this.entityCache.clear();
  });

  delete = jest.fn().mockImplementation(async (id: number) => {
    // this.locals = this.locals.filter((item: T) => item.id !== id);
    await this.entityCache.delete(id);
  });

  bulkDelete = jest.fn().mockImplementation(async (ids: number[]) => {
    // _.each(ids, (id: number) => this.delete(id));
    await this.entityCache.bulkDelete(ids);
  });

  update = jest
    .fn()
    .mockImplementation(async (item: Partial<T> | Partial<T>[]) => {
      await this.entityCache.update(item);
    });

  bulkUpdate = jest.fn().mockImplementation(async (array: Partial<T>[]) => {
    await this.entityCache.bulkUpdate(array);
  });

  batchGet = jest
    .fn()
    .mockImplementation(
      async (ids: number[], order?: boolean) =>
        await this.entityCache.batchGet(ids, order),
    );
  // get = jest.fn().mockImplementation((id: number) => {
  //   return this.getEntityLocally(id);
  // });

  // getEntityLocally = jest.fn().mockImplementation(async (id: number) => {
  //   return _.find(this.locals, (item: T) => item.id === id);
  // });

  // getEntitiesLocally = jest
  //   .fn()
  //   .mockImplementation(async (ids: number[], includeDeactivated: boolean) => {
  //     return _.find(this.locals, (item: T) => _.includes(ids, item.id));
  //   });

  // getEntityNotificationKey = jest.fn().mockReturnValue('test');

  // getAll = jest.fn().mockImplementation(() => this.locals);

  // getTotalCount = jest.fn().mockImplementation(() => this.locals.length);

  // getEntityName = jest.fn().mockReturnValue('test');

  // putOne = jest.fn().mockImplementation((item: T) => {
  //   this.locals.push(item);
  // });

  // put = jest.fn().mockImplementation((item: T) => {
  //   if (Array.isArray(item)) {
  //     this.bulkPut(item);
  //   } else {
  //     this.putOne(item);
  //   }
  // });

  // bulkPut = jest.fn().mockImplementation((array: T[]) => {
  //   this.locals = this.locals.concat(array);
  // });

  // clear = jest.fn().mockImplementation(() => {
  //   this.locals = [];
  // });

  // delete = jest.fn().mockImplementation((id: number) => {
  //   this.locals = this.locals.filter((item: T) => item.id !== id);
  // });

  // bulkDelete = jest.fn().mockImplementation((ids: number[]) => {
  //   _.each(ids, (id: number) => this.delete(id));
  // });

  // updateOne = jest.fn().mockImplementation((item: Partial<T>) => {
  //   const index = _.findIndex(this.locals, (it: T) => it.id === item.id);
  //   if (index > -1) {
  //     this.locals[index] = {
  //       ...this.locals[index],
  //       ...item,
  //     };
  //   }
  // });

  // update = jest.fn().mockImplementation((item: Partial<T> | Partial<T>[]) => {
  //   if (Array.isArray(item)) {
  //     this.bulkUpdate(item);
  //   } else {
  //     this.updateOne(item);
  //   }
  // });

  // bulkUpdate = jest.fn().mockImplementation((array: Partial<T>[]) => {
  //   _.each(array, (item: Partial<T>) => {
  //     this.updateOne(item);
  //   });
  // });

  // batchGet = jest
  //   .fn()
  //   .mockImplementation(async (ids: number[], order?: boolean) => {
  //     return ids.map((id: number) => {
  //       return this.factory.build({
  //         id,
  //       } as T);
  //     });
  //   });
}
