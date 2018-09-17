import { IIDSortKey } from '../store';
import OrderListStore from './OrderListStore';
type TDelta<I, E> = {
  deleted: number[];
  updated: I[];
  updateEntity: E[];
};
function handleDelete<T>(matchedKeys: number[]): TDelta<IIDSortKey, T> {
  return {
    deleted: matchedKeys,
    updated: [],
    updateEntity: [],
  };
}

function handleReplace<T>(
  matchedKeys: number[],
  entities: Map<number, T & { id: number; data: T }>,
  transformFunc: Function,
): TDelta<IIDSortKey, T> {
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
  store: OrderListStore,
): TDelta<IIDSortKey, T> {
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
): TDelta<IIDSortKey, T> {
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
  TDelta,
};
