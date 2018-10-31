/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:05
 * Copyright © RingCentral. All rights reserved.
 */
import { transform, isFunction } from '../service/utils';
import { BaseError, ErrorParser } from '../utils';
import { daoManager, DeactivatedDao } from '../dao';
import { BaseModel, Raw } from '../models'; // eslint-disable-line
import { mainLogger } from 'foundation';
import { AbstractService } from '../framework';
import notificationCenter from './notificationCenter';
import { container } from '../container';
import dataDispatcher from '../component/DataDispatcher';
import { SOCKET } from './eventKey';
import _ from 'lodash';

const throwError = (text: string): never => {
  throw new Error(
    // tslint:disable-next-line:max-line-length
    `${text} is undefined! ${text} must be passed to Service constructor like this super(DaoClass, ApiClass, handleData)`,
  );
};

class BaseService<
  SubModel extends BaseModel = BaseModel
> extends AbstractService {
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
    this._checkDaoClass();
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

  async getAllFromDao({ offset = 0, limit = Infinity } = {}): Promise<
    SubModel[]
  > {
    this._checkDaoClass();
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
    this._subscribe();
  }

  protected onStopped(): void {
    this._unsubscribe();
  }

  private _subscribe() {
    Object.entries(this._subscriptions).forEach(([eventName, fn]) => {
      if (eventName.startsWith('SOCKET')) {
        return dataDispatcher.register(eventName as SOCKET, fn);
      }
      notificationCenter.on(eventName, fn);
    });
  }

  private _unsubscribe() {
    Object.entries(this._subscriptions).forEach(([eventName, fn]) => {
      if (eventName.startsWith('SOCKET')) {
        return dataDispatcher.unregister(eventName as SOCKET, fn);
      }
      notificationCenter.off(eventName, fn);
    });
  }

  private _checkDaoClass() {
    if (!this.DaoClass) {
      throwError('DaoClass');
    }
    return true;
  }

  async handlePartialUpdate(
    partialModel: Partial<Raw<SubModel>>,
    preHandlePartialModel?: (
      partialModel: Partial<Raw<SubModel>>,
      originalModel: SubModel,
    ) => Partial<Raw<SubModel>>,
    doUpdateModel?: (updatedModel: SubModel) => Promise<SubModel | BaseError>,
    doPartialNotify?: (
      originalModels: SubModel[],
      partialModels: Partial<Raw<SubModel>>[],
    ) => void,
  ): Promise<SubModel | BaseError> {
    const id: number = partialModel.id
      ? partialModel.id
      : partialModel._id
        ? partialModel._id
        : 0;
    let result: SubModel | BaseError;

    do {
      if (id <= 0) {
        mainLogger.warn('handlePartialUpdate: invalid id');
        result = ErrorParser.parse('none model error');
        break;
      }

      const originalModel = await this.getById(id);
      if (!originalModel) {
        mainLogger.warn('handlePartialUpdate: originalModel is nil');
        result = ErrorParser.parse('none model error');
        break;
      }

      if (!doUpdateModel) {
        mainLogger.warn(
          'handlePartialUpdate: doUpdateModel is nil, no updates',
        );
        result = originalModel;
        break;
      }

      result = await this._handlePartialUpdateWithOriginal(
        preHandlePartialModel
          ? await preHandlePartialModel(partialModel, originalModel)
          : partialModel,
        originalModel,
        doUpdateModel,
        doPartialNotify,
      );
    } while (false);

    return result;
  }

  getRollbackPartialModel(
    partialModel: Partial<Raw<SubModel>>,
    originalModel: SubModel,
  ): Partial<Raw<SubModel>> {
    const rollbackPartialModel = _.pick(
      originalModel,
      Object.keys(partialModel),
    );
    return rollbackPartialModel as Partial<Raw<SubModel>>;
  }

  getMergedModel(
    partialModel: Partial<Raw<SubModel>>,
    originalModel: SubModel,
  ): SubModel {
    const cloneO = _.cloneDeep(originalModel);
    const keys = Object.keys(partialModel);
    keys.forEach((key: string) => {
      cloneO[key] = _.cloneDeep(partialModel[key]);
    });
    return cloneO;
  }

  async updatePartialModel2Db(partialModels: Partial<Raw<SubModel>>[]) {
    if (!this.DaoClass) {
      mainLogger.warn('updatePartialModel2Db: no dao class');
      return;
    }

    const transformedModels: SubModel[] = [];
    partialModels.forEach((item: Partial<Raw<SubModel>>) => {
      const transformedModel: SubModel = transform(item);
      transformedModels.push(transformedModel);
    });
    const dao = daoManager.getDao(this.DaoClass);
    await dao.bulkUpdate(transformedModels);
  }

  private async _handlePartialUpdateWithOriginal(
    partialModel: Partial<Raw<SubModel>>,
    originalModel: SubModel,
    doUpdateModel: (updatedModel: SubModel) => Promise<SubModel | BaseError>,
    doPartialNotify?: (
      originalModels: SubModel[],
      partialModels: Partial<Raw<SubModel>>[],
    ) => void,
  ): Promise<SubModel | BaseError> {
    let result: SubModel | BaseError;
    do {
      partialModel.id = originalModel.id;
      if (partialModel._id) {
        delete partialModel._id;
      }

      const rollbackPartialModel = this.getRollbackPartialModel(
        partialModel,
        originalModel,
      );

      if (_.isEqual(partialModel, rollbackPartialModel)) {
        result = originalModel;
        mainLogger.warn('handlePartialUpdate: no changes, no need update');
        break;
      }

      mainLogger.info('handlePartialUpdate: trigger partial update');
      await this._doPartialSaveAndNotify(
        originalModel,
        partialModel,
        doPartialNotify,
      );

      mainLogger.info('handlePartialUpdate: trigger doUpdateModel');
      const mergedModel = this.getMergedModel(partialModel, originalModel);
      const resp = await doUpdateModel(mergedModel);
      if (resp instanceof BaseError) {
        mainLogger.error('handlePartialUpdate: doUpdateModel failed');
        await this._doPartialSaveAndNotify(
          mergedModel,
          rollbackPartialModel,
          doPartialNotify,
        );
      }

      result = resp;
    } while (false);

    return result;
  }

  private async _doPartialSaveAndNotify(
    originalModel: SubModel,
    model: Partial<Raw<SubModel>>,
    doPartialNotify?: (
      originalModels: SubModel[],
      partialModels: Partial<Raw<SubModel>>[],
    ) => void,
  ): Promise<void> {
    const originalModels: SubModel[] = [originalModel];
    const partialModels: Partial<Raw<SubModel>>[] = [model];

    await this.updatePartialModel2Db(partialModels);

    if (doPartialNotify) {
      doPartialNotify(originalModels, partialModels);
    } else {
      if (this.DaoClass) {
        const dao = daoManager.getDao(this.DaoClass);
        const modelName = dao.modelName.toUpperCase();
        const eventKey: string = `ENTITY.${modelName}`;
        mainLogger.info(`_doPartialSaveAndNotify: eventKey= ${eventKey}`);
        notificationCenter.emitEntityUpdate(eventKey, partialModels);
      }
    }
  }
}

export default BaseService;
