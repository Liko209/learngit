/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:05
 * Copyright © RingCentral. All rights reserved.
 */
import { transform, isFunction } from '../service/utils';
import { daoManager, DeactivatedDao } from '../dao';
import { BaseModel } from '../models'; // eslint-disable-line
import { mainLogger } from 'foundation';
import { AbstractService } from '../framework';
import notificationCenter from './notificationCenter';
import { container } from '../container';
import dataDispatcher from '../component/DataDispatcher';
import { SOCKET } from './eventKey';

const throwError = (text: string): never => {
  throw new Error(
    `${text} is undefined! ${text} must be passed to Service constructor like this super(DaoClass, ApiClass, handleData)`,
  );
};

class BaseService<SubModel extends BaseModel = BaseModel> extends AbstractService {
  static serviceName = 'BaseService';

  constructor(
    public DaoClass?: any,
    public ApiClass?: any,
    public handleData?: any,
    private _subscriptions: Object = {},
  ) {
    super();
    mainLogger.info('BaseService constructor');
  }

  static getInstance<T extends BaseService<any>>(): T {
    return container.get(this.name) as T;
  }

  async getById(id: number): Promise<SubModel> {
    let result = await this.getByIdFromDao(id);
    if (!result) {
      result = await this.getByIdFromAPI(id);
    }
    return result;
  }

  async getByIdFromDao(id: number): Promise<SubModel> {
    this.checkDaoClass();
    const dao = daoManager.getDao(this.DaoClass);
    const result = await dao.get(id);
    return result || daoManager.getDao(DeactivatedDao).get(id);
  }

  async getByIdFromAPI(id: number): Promise<SubModel> {
    if (!this.ApiClass || !isFunction(this.handleData)) {
      throwError('ApiClass || HandleData');
    }
    if (id <= 0) {
      throwError('invalid id, should not do network request');
    }
    let result = await this.ApiClass.getDataById(id);
    if (result && result.data) {
      const arr = [].concat(result.data).map(transform); // normal transform
      await this.handleData(arr);
      result = arr.length > 0 ? arr[0] : null;
    }
    return result;
  }

  async getAllFromDao({ offset = 0, limit = Infinity } = {}): Promise<SubModel[]> {
    this.checkDaoClass();
    const dao = daoManager.getDao(this.DaoClass);

    return dao
      .createQuery()
      .offset(offset)
      .limit(limit)
      .toArray();
  }

  async getAll({ offset = 0, limit = Infinity } = {}): Promise<SubModel[]> {
    return this.getAllFromDao({ offset, limit });
  }

  protected onStarted(): void {
    this.subscribe();
  }

  protected onStopped(): void {
    this.unsubscribe();
  }

  private subscribe() {
    Object.entries(this._subscriptions).forEach(([eventName, fn]) => {
      if (eventName.startsWith('SOCKET')) {
        return dataDispatcher.register(eventName as SOCKET, fn);
      }
      notificationCenter.on(eventName, fn);
    });
  }

  private unsubscribe() {
    Object.entries(this._subscriptions).forEach(([eventName, fn]) => {
      if (eventName.startsWith('SOCKET')) {
        return dataDispatcher.unregister(eventName as SOCKET, fn);
      }
      notificationCenter.off(eventName, fn);
    });
  }

  private checkDaoClass() {
    if (!this.DaoClass) {
      throwError('DaoClass');
    }
    return true;
  }
}

export default BaseService;
