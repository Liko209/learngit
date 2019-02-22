/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, Raw } from '../../../framework/model';
import { ErrorHandlingController } from './ErrorHandlingController';
import { transform } from '../../../service/utils';
import NetworkClient from '../../../api/NetworkClient';
import { IRequestController } from '../interface/IRequestController';

class RequestController<T extends IdModel = IdModel>
  implements IRequestController<T> {
  constructor(
    public networkConfig: { basePath: string; networkClient: NetworkClient },
  ) {}

  async get(id: number): Promise<T | null> {
    if (id <= 0) {
      const error = new ErrorHandlingController();
      error.throwInvalidParameterError('id', id);
    }

    const resultData = await this._get(id);
    return transform<T>(resultData);
  }

  async put(data: Partial<T>) {
    const id: number | undefined = this._validId(data);

    if (!id || id < 0) {
      const error = new ErrorHandlingController();
      error.throwInvalidParameterError('id', id);
    }

    const resultData = await this._put<T>(id!, data);
    return transform<T>(resultData);
  }

  async post(data: Partial<T>) {
    const resultData = await this._post<T>(data);
    return transform<T>(resultData);
  }

  private async _get(id: number) {
    return this.networkConfig.networkClient.get<Raw<T>>(
      `${this.networkConfig.basePath}/${id}`,
    );
  }

  private async _post<T>(data: Partial<T>) {
    return this.networkConfig.networkClient.post<Raw<T>>(
      `${this.networkConfig.basePath}`,
      data,
    );
  }

  private async _put<T>(id: number, data: Partial<T>) {
    return this.networkConfig.networkClient.put<Raw<T>>(
      `${this.networkConfig.basePath}/${id}`,
      data,
    );
  }

  private _validId(data: Partial<T>) {
    let id: number | undefined = undefined;
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
