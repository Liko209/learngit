import { ISortableModel } from '@/store/base/fetch/types';
import { SortableListStore } from './SortableListStore';
import { TReplacedData } from './FetchSortableDataListHandler';
import { IIDSortKey } from '../../store';

type TChangeHandler<T> = (
  matchedKeys: number[],
  entities?: Map<number, T | TReplacedData<T>>,
  transformFunc?: Function,
  store?: SortableListStore,
) => {
  deleted: number[];
  updated: ISortableModel[];
  updateEntity: T[];
};

function handleDelete<T>(matchedKeys: number[]) {
  return {
    deleted: matchedKeys,
    updated: [],
    updateEntity: [],
  };
}

function handleReplace<T>(
  matchedKeys: number[],
  entities: Map<number, T | TReplacedData<T>>,
  transformFunc: Function,
) {
  const updated: IIDSortKey[] = [];
  const updateEntity: T[] = [];
  const deleted: number[] = [];
  matchedKeys.forEach((key: number) => {
    const entity = entities.get(key) as { id: number; data: T };
    const { data } = entity;
    const idSortKey = transformFunc(data);
    updated.push(idSortKey);
    updateEntity.push(data);
    deleted.push(key);
  });
  return {
    deleted,
    updated,
    updateEntity,
  };
}

function handleReplaceAll<T>(
  matchedKeys: number[],
  entities: Map<number, T>,
  transformFunc: Function,
  store: SortableListStore,
) {
  const updated: IIDSortKey[] = [];
  const updateEntity: T[] = [];
  const deleted: number[] = store.getIds();
  entities.forEach((entity: T) => {
    const idSortKey = transformFunc(entity);
    updated.push(idSortKey);
    updateEntity.push(entity);
  });
  return {
    deleted,
    updated,
    updateEntity,
  };
}

function handleUpdateAndPut<T>(
  matchedKeys: number[],
  entities: Map<number, T>,
  transformFunc: Function,
) {
  const updated: IIDSortKey[] = [];
  const updateEntity: T[] = [];
  const deleted: number[] = [];
  matchedKeys.forEach((key: number) => {
    const entity = entities.get(key) as T;
    const idSortKey = transformFunc(entity);
    updated.push(idSortKey);
    updateEntity.push(entity);
  });
  return {
    deleted,
    updated,
    updateEntity,
  };
}

export {
  handleDelete,
  handleReplace,
  handleReplaceAll,
  handleUpdateAndPut,
  TChangeHandler,
};
