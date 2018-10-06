/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:50:11
 * Copyright © RingCentral. All rights reserved.
 */
import ISortableModel from './ISortableModel';
import FetchDataListHandler, {
  IFetchDataListHandlerOptions,
} from './FetchDataListHandler';
import IFetchDataProvider from './IFetchDataProvider';
import SortableListStore from '@/store/base/fetch/SortableListStore';
import { ISortFunc } from './SortableListStore';
import { FetchDataDirection } from '../constants';

export type IMatchFunc = <T>(model: T) => boolean;

export type ITransformFunc = <T>(model: T, index: number) => ISortableModel<T>;

export interface IFetchSortableDataListHandlerOptions
  extends IFetchDataListHandlerOptions {
  isMatchFunc: IMatchFunc;
  transformFunc: ITransformFunc;
  sortFunc: ISortFunc;
}

export abstract class AbstractFetchSortableDataHandler<T>
  implements IFetchDataProvider<ISortableModel<T>> {
  protected _transformFunc: ITransformFunc;
  constructor(transformFunc: ITransformFunc) {
    this._transformFunc = transformFunc;
  }

  async fetchData(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: ISortableModel<T> | null,
  ): Promise<ISortableModel<T>[]> {
    const result = await this.fetchDataImpl(
      offset,
      direction,
      pageSize,
      anchor,
    );
    const transformedData: ISortableModel<T>[] = [];
    result.forEach((item, index) => {
      transformedData.push(this._transformFunc(item, index));
    });

    return Promise.resolve(transformedData);
  }

  protected abstract fetchDataImpl(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: ISortableModel<T> | null,
  ): Promise<T[]>;
}

export default class FetchSortableDataListHandler<
  T
> extends FetchDataListHandler<ISortableModel<T>> {
  constructor(
    dataProvider: AbstractFetchSortableDataHandler<T>,
    options: IFetchSortableDataListHandlerOptions,
  ) {
    super(dataProvider, options, new SortableListStore<T>(options.sortFunc));
  }
}
