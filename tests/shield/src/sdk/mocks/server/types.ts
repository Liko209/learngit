export interface IStore<T extends object, Id extends number | string = number> {
  // items: T[];
  create(item: Partial<T>): T | undefined;
  delete(id: Id): void;
  update(item: Partial<T>): void;
  getById(id: Id): T | null;
  getByIds(ids: Id[]): (T | undefined)[];
  getItems(options: { limit: number; direction: string }): T[];
}
