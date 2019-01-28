import { ISortableModel, TReplacedData, TUpdated } from './types';
import { SortableListStore } from './SortableListStore';
import _ from 'lodash';

function diff(keys: number[], store: SortableListStore) {
  const existKeys = store.getIds;
  const matchedKeys = _.intersection(keys, existKeys);
  const differentKeys = _.difference(keys, existKeys);
  return { matchedKeys, differentKeys };
}

function handleDelete<T>(
  keys: number[],
  entities: Map<number, T | TReplacedData<T>>,
  transformFunc: Function,
  store: SortableListStore,
) {
  const { matchedKeys } = diff(keys, store);
  return {
    deleted: matchedKeys,
    updated: [],
    updateEntity: [],
    added: [],
  };
}

function handleUpsert<T>(
  keys: number[],
  entities: Map<number, T | TReplacedData<T>>,
  transformFunc: Function,
  store: SortableListStore,
) {
  const { matchedKeys, differentKeys } = diff(keys, store);
  const updated: TUpdated = [];
  const updateEntity: T[] = [];
  const deleted: number[] = [];
  const added: ISortableModel[] = [];
  matchedKeys.forEach((key: number) => {
    const entity = entities.get(key) as { id: number; data: T };
    const data = (entity.data || entity) as T;
    const idSortKey = transformFunc(data);
    const index = store.getIds.indexOf(key);
    if (entity.data) {
      updated.push({
        index,
        value: idSortKey,
        oldValue: store.getById(entity.id),
      });
    } else {
      added.push(idSortKey);
    }
    updateEntity.push(data);
  });

  differentKeys.forEach((key: number) => {
    const model = entities.get(key) as T;
    const sortable = transformFunc(model);
    updateEntity.push(model);
    added.push(sortable);
  });
  return {
    deleted,
    updated,
    updateEntity,
    added,
  };
}

function handleReplaceAll<T>(
  keys: number[],
  entities: Map<number, T>,
  transformFunc: Function,
  store: SortableListStore,
) {
  const updateEntity: T[] = [];
  const deleted: number[] = store.getIds;
  const added: ISortableModel[] = keys.map((key: number) => {
    const model = entities.get(key) as T;
    return transformFunc(model);
  });
  return {
    deleted,
    updateEntity,
    added,
  };
}

export { handleDelete, handleReplaceAll, handleUpsert };
