/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, Raw, ModelIdType } from '../../../framework/model';
import { ErrorHandlingController } from './ErrorHandlingController';
import { transform } from '../../../service/utils';
import NetworkClient, { IBaseQuery } from '../../../api/NetworkClient';
import { IRequestController } from '../interface/IRequestController';

class RequestController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> implements IRequestController<T, IdType> {
  constructor(
    public networkConfig: { basePath: string; networkClient: NetworkClient },
  ) {}

  async get(id: IdType, options?: Partial<IBaseQuery>): Promise<T | null> {
    if (typeof id === typeof 0 && id <= 0) {
      const error = new ErrorHandlingController();
      error.throwInvalidParameterError('id', id);
    }

    const resultData = await this._get(id, options);
    return transform<T>(resultData);
  }

  async put(data: Partial<T>, options?: Partial<IBaseQuery>) {
    const id: IdType | undefined = this._validId(data);

    if (!id || (typeof id === typeof 0 && id < 0)) {
      const error = new ErrorHandlingController();
      error.throwInvalidParameterError('id', id);
    }

    const resultData = await this._put<T>(id!, data, options);
    return transform<T>(resultData);
  }

  async post(data: Partial<T>, options?: Partial<IBaseQuery>) {
    const resultData = await this._post<T>(data, options);
    return transform<T>(resultData);
  }

  private async _get(id: IdType, options?: Partial<IBaseQuery>) {
    return this.networkConfig.networkClient.get<Raw<T>>({
      path: `${this.networkConfig.basePath}/${id}`,
      ...options,
    });
  }

  private async _post<T>(data: Partial<T>, options?: Partial<IBaseQuery>) {
    return this.networkConfig.networkClient.post<Raw<T>>({
      data,
      path: `${this.networkConfig.basePath}`,
      ...options,
    });
  }

  private async _put<T>(
    id: IdType,
    data: Partial<T>,
    options?: Partial<IBaseQuery>,
  ) {
    return this.networkConfig.networkClient.put<Raw<T>>({
      data,
      path: `${this.networkConfig.basePath}/${id}`,
      ...options,
    });
  }

  private _validId(data: Partial<T>) {
    let id: IdType | undefined = undefined;
    if (data.id) {
      id = data.id;
      delete data.id;
    }

    if (data._id) {
      id = data._id;
    } else {
      data._id = id;
    }

    return id;
  }
}

export { RequestController };
