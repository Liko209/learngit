/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:05
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation';
import { transform, isFunction } from '../service/utils';
import { BaseError, ErrorParser } from '../utils';
import { daoManager, DeactivatedDao } from '../dao';
import { BaseModel, Raw, SortableModel } from '../models'; // eslint-disable-line
import { AbstractService } from '../framework';
import notificationCenter, {
  NotificationEntityPayload,
} from './notificationCenter';
import { container } from '../container';
import dataDispatcher from '../component/DataDispatcher';
import { NetworkResult } from '../api/NetworkResult';
import { SOCKET, SERVICE } from './eventKey';
import _ from 'lodash';
import EntityCacheManager from './entityCacheManager';
import { EVENT_TYPES } from './constants';

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
  private _cachedManager: EntityCacheManager<SubModel>;

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

  protected async shouldSaveItemFetchedById(
    item: Raw<SubModel>,
  ): Promise<boolean | undefined> {
    return true;
  }

  async getById(id: number): Promise<SubModel | null> {
    const result = await this.getByIdFromDao(id);
    if (!result) {
      return this.getByIdFromAPI(id);
    }
    return result;
  }

  async getByIdFromDao(id: number): Promise<SubModel> {
    this._checkDaoClass();
    const dao = daoManager.getDao(this.DaoClass);
    const result = await dao.get(id);
    return result || daoManager.getDao(DeactivatedDao).get(id);
  }

  async getByIdFromAPI(id: number): Promise<SubModel | null> {
    if (!this.ApiClass || !isFunction(this.handleData)) {
      throwError('ApiClass || HandleData');
    }
    if (id <= 0) {
      throwError('invalid id, should not do network request');
    }
    const result: NetworkResult<any> = await this.ApiClass.getDataById(id);
    if (result.isOk()) {
      const arr: SubModel[] = []
        .concat(result.data)
        .map((item: Raw<SubModel>) => transform(item)); // normal transform
      const shouldSaveToDB = await this.shouldSaveItemFetchedById(result.data);
      await this.handleData(arr, shouldSaveToDB);
      return arr.length > 0 ? arr[0] : null;
    }
    return null;
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

  isCacheEnable(): boolean {
    return this._cachedManager ? true : false;
  }

  enableCache() {
    if (!this._cachedManager) {
      this._cachedManager = new EntityCacheManager<SubModel>();

      notificationCenter.on(SERVICE.LOGIN, () => {
        this.initialEntitiesCache();
      });

      notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
        this.initialEntitiesCache();
      });
    }
  }

  async clearCache() {
    this.getCacheManager().clear();
  }

  getCacheManager() {
    if (!this._cachedManager) {
      mainLogger.error('cache manager is not initialized');
    }
    return this._cachedManager;
  }

  getEntityFromCache(id: number): SubModel | null {
    return this.getCacheManager().getEntity(id);
  }

  async getEntitiesFromCache(
    filterFunc?: (entity: SubModel) => boolean,
  ): Promise<SubModel[]> {
    return this.getCacheManager().getEntities(filterFunc);
  }

  async searchEntitiesFromCache(
    genSortableModelFunc: (
      entity: SubModel,
      terms: string[],
    ) => SortableModel<SubModel> | null,
    searchKey?: string,
    arrangeIds?: number[],
    sortFunc?: (
      entityA: SortableModel<SubModel>,
      entityB: SortableModel<SubModel>,
    ) => number,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<SubModel>[];
  } | null> {
    let terms: string[] = [];
    let entities: SubModel[];
    const sortableEntities: SortableModel<SubModel>[] = [];

    if (searchKey) {
      terms = this.getTermsFromSearchKey(searchKey.trim());
    }

    if (arrangeIds) {
      entities = await this.getCacheManager().getMultiEntities(arrangeIds);
    } else {
      entities = await this.getEntitiesFromCache();
    }

    entities.forEach((entity: SubModel) => {
      const result = genSortableModelFunc(entity, terms);
      if (result) {
        sortableEntities.push(result);
      }
    });

    if (sortFunc) {
      sortableEntities.sort(sortFunc);
    }

    return { terms, sortableModels: sortableEntities };
  }

  isFuzzyMatched(srcText: string, terms: string[]): boolean {
    return srcText.length > 0
      ? terms.reduce(
          (prev: boolean, key: string) =>
            prev && new RegExp(`${key}`, 'i').test(srcText),
          true,
        )
      : false;
  }

  sortEntitiesByName(
    entityA: SortableModel<SubModel>,
    entityB: SortableModel<SubModel>,
  ) {
    if (entityA.sortKey < entityB.sortKey) {
      return -1;
    }
    if (entityA.sortKey > entityB.sortKey) {
      return 1;
    }
    return 0;
  }

  protected getTermsFromSearchKey(searchKey: string) {
    return searchKey.split(/[\s,]+/);
  }

  protected async initialEntitiesCache() {
    mainLogger.debug('initialEntitiesCache begin');
    if (this._cachedManager && !this._cachedManager.isInitialized()) {
      const eventKey: string = this._getModelEventKey();
      if (eventKey.length > 0) {
        notificationCenter.on(
          eventKey,
          (payload: NotificationEntityPayload<SubModel>) => {
            this.onCacheEntitiesChange(payload);
          },
        );
      }

      const dao = daoManager.getDao(this.DaoClass);
      const models = await dao.getAll();
      this._cachedManager.initialize(models);
      mainLogger.debug('initialEntitiesCache done');
    } else {
      mainLogger.debug(
        'initial cache without permission or already initialized',
      );
    }
  }

  protected async onCacheEntitiesChange(
    payload: NotificationEntityPayload<SubModel>,
  ) {
    switch (payload.type) {
      case EVENT_TYPES.REPLACE:
        await this._cachedManager.replace(
          payload.body.ids,
          payload.body.entities,
        );
        break;
      case EVENT_TYPES.UPDATE:
        await this._cachedManager.update(
          payload.body.entities,
          payload.body.partials,
        );
        break;
      case EVENT_TYPES.DELETE:
        await this._cachedManager.delete(payload.body.ids);
        break;
    }
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
      updatedModels: SubModel[],
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

  private _getModelEventKey(): string {
    if (this.DaoClass) {
      const dao = daoManager.getDao(this.DaoClass);
      const modelName = dao.modelName.toUpperCase();
      const eventKey: string = `ENTITY.${modelName}`;
      return eventKey;
    }
    return '';
  }

  private _doDefaultPartialNotify(
    updatedModels: SubModel[],
    partialModels: Partial<Raw<SubModel>>[],
  ) {
    const eventKey: string = this._getModelEventKey();
    if (eventKey.length > 0) {
      mainLogger.info(`_doDefaultPartialNotify: eventKey= ${eventKey}`);
      notificationCenter.emitEntityUpdate(
        eventKey,
        updatedModels,
        partialModels,
      );
    } else {
      mainLogger.warn('_doDefaultPartialNotify: no dao class');
    }
  }

  private async _handlePartialUpdateWithOriginal(
    partialModel: Partial<Raw<SubModel>>,
    originalModel: SubModel,
    doUpdateModel: (updatedModel: SubModel) => Promise<SubModel | BaseError>,
    doPartialNotify?: (
      originalModels: SubModel[],
      updatedModels: SubModel[],
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

      const mergedModel = this.getMergedModel(partialModel, originalModel);

      mainLogger.info('handlePartialUpdate: trigger partial update');
      await this._doPartialSaveAndNotify(
        originalModel,
        mergedModel,
        partialModel,
        doPartialNotify,
      );

      mainLogger.info('handlePartialUpdate: trigger doUpdateModel');

      const resp = await doUpdateModel(mergedModel);
      if (resp instanceof BaseError) {
        mainLogger.error('handlePartialUpdate: doUpdateModel failed');
        const fullRollbackModel = this.getMergedModel(
          rollbackPartialModel,
          mergedModel,
        );
        await this._doPartialSaveAndNotify(
          mergedModel,
          fullRollbackModel,
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
    updatedModel: SubModel,
    partialModel: Partial<Raw<SubModel>>,
    doPartialNotify?: (
      originalModels: SubModel[],
      updatedModels: SubModel[],
      partialModels: Partial<Raw<SubModel>>[],
    ) => void,
  ): Promise<void> {
    const originalModels: SubModel[] = [originalModel];
    const updatedModels: SubModel[] = [updatedModel];
    const partialModels: Partial<Raw<SubModel>>[] = [partialModel];

    await this.updatePartialModel2Db(partialModels);

    if (doPartialNotify) {
      doPartialNotify(originalModels, updatedModels, partialModels);
    } else {
      this._doDefaultPartialNotify(updatedModels, partialModels);
    }
  }
}

export default BaseService;
