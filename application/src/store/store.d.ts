export type IEntity = {
  id: number;
  data?: any;
  dispose?: () => void;
  [name: string]: any;
}

export type IIncomingData<T> = {
  type: string;
  entities: Map<number, T>;
}

export type IIDSortKey = {
  id: number;
  sortKey: number;
}
