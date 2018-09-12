import { IIDSortKey } from '../store';
import OrderListStore from './OrderListStore';

function handleDelete<T>(matchedKeys: number[]) {
  return {
    deleted: matchedKeys,
    updated: [],
    updateEntity: [],
  };
}

function handleReplace<T>(matchedKeys: number[], entities: Map<number, T & { id: number, data: T }>, transformFunc: Function) {
  const updated: IIDSortKey[] = [];
  const updateEntity: T[] = [];
  const deleted: number[] = [];
  matchedKeys.forEach((key) => {
    const entity = entities.get(key) as { id: number, data: T };
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

function handleReplaceAll<T>(matchedKeys: number[], entities: Map<number, T>, transformFunc: Function, store: OrderListStore) {
  const updated: IIDSortKey[] = [];
  const updateEntity: T[] = [];
  const deleted: number[] = store.getIds();
  entities.forEach((entity) => {
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

function handleUpdateAndPut<T>(matchedKeys: number[], entities: Map<number, T>, transformFunc: Function) {
  const updated: IIDSortKey[] = [];
  const updateEntity: T[] = [];
  const deleted: number[] = [];
  matchedKeys.forEach((key) => {
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
};
