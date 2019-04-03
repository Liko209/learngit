/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:05
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { mainLogger } from 'foundation';
import { transform, isFunction } from '../service/utils';
import { daoManager, DeactivatedDao } from '../dao';
import { IdModel, Raw, SortableModel } from '../framework/model';
import { AbstractService } from '../framework';
import notificationCenter, {
  NotificationEntityPayload,
} from './notificationCenter';
import { container } from '../container';
import dataDispatcher from '../component/DataDispatcher';
import { SOCKET, SERVICE } from './eventKey';
import EntityCacheManager from './entityCacheManager';
import { EVENT_TYPES } from './constants';
import { ERROR_CODES_SDK, JSdkError } from '../error';

const throwError = (text: string): never => {
  throw new JSdkError(
    ERROR_CODES_SDK.GENERAL,
    // tslint:disable-next-line:max-line-length
    `${text} is undefined! ${text} must be passed to Service constructor like this super(DaoClass, ApiClass, handleData)`,
  );
};

class BaseService<SubModel extends IdModel = IdModel> extends AbstractService {
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
    return container.get(this.name);
  }

  protected async shouldSaveItemFetchedById(
    item: Raw<SubModel>,
  ): Promise<boolean | undefined> {
    return true;
  }

  async getById(id: number): Promise<SubModel | null> {
    const result = await this.getByIdFromLocal(id);
    if (!result) {
      return this.getByIdFromAPI(id);
    }
    return result;
  }

  getSynchronously(id: number): SubModel | null {
    let result: SubModel | null = null;
    if (this.isCacheInitialized()) {
      result = this.getEntityFromCache(id);
    }
    return result;
  }

  async getByIdFromLocal(id: number): Promise<SubModel> {
    let result: SubModel | null = this.getSynchronously(id);
    if (!result) {
      result = await this.getByIdFromDao(id);
    }
    return result;
  }

  async getByIdFromDao(id: number): Promise<SubModel> {
    this._checkDaoClass();
    const dao = daoManager.getDao(this.DaoClass);
    const result = await dao.get(id);
    return result || (await this._getDeactivatedModelLocally(id));
  }

  private async _getDeactivatedModelsLocally(
    ids: number[],
  ): Promise<SubModel[]> {
    const dao = daoManager.getDao(DeactivatedDao);
    return await dao.batchGet(ids);
  }

  private async _getDeactivatedModelLocally(id: number): Promise<SubModel> {
    const dao = daoManager.getDao(DeactivatedDao);
    return await dao.get(id);
  }

  async getModelsLocally(
    ids: number[],
    includeDeactivated: boolean,
  ): Promise<SubModel[]> {
    if (ids.length <= 0) {
      return [];
    }
    const dao = daoManager.getDao(this.DaoClass);
    let models = await dao.batchGet(ids);
    if (includeDeactivated && models.length !== ids.length) {
      const modelIds = models.map(model => model.id);
      const diffIds = _.difference(ids, modelIds);
      const deactivateModels = await this._getDeactivatedModelsLocally(diffIds);
      models = _.concat(models, deactivateModels);
    }
    return models;
  }

  async getByIdFromAPI(id: number): Promise<SubModel | null> {
    if (!this.ApiClass || !isFunction(this.handleData)) {
      throwError('ApiClass || HandleData');
    }
    if (id <= 0) {
      throwError(`invalid id(${id}), should not do network request`);
    }
    let result;
    try {
      result = await this.ApiClass.getDataById(id);
    } catch (error) {
      result = null;
    }
    const arr: SubModel[] = []
      .concat(result)
      .filter(item => !!item)
      .map((item: Raw<SubModel>) => transform(item)); // normal transform
    const shouldSaveToDB = await this.shouldSaveItemFetchedById(result);
    await this.handleData(arr, shouldSaveToDB);
    return arr.length > 0 ? arr[0] : null;
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
    if (this.isCacheInitialized()) {
      const values = await this.getEntitiesFromCache();
      return values.slice(0, limit === Infinity ? values.length : limit);
    }
    return this.getAllFromDao({ offset, limit });
  }

  isCacheInitialized() {
    return this.isCacheEnable() && this._cachedManager.isInitialized();
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

  async getMultiEntitiesFromCache(
    ids: number[],
    filterFunc?: (entity: SubModel) => boolean,
  ): Promise<SubModel[]> {
    const entities = await this.getCacheManager().getMultiEntities(ids);

    if (filterFunc) {
      const filteredResult: SubModel[] = [];
      entities.forEach((entity: SubModel) => {
        if (filterFunc(entity)) {
          filteredResult.push(entity);
        }
      });
      return filteredResult;
    }
    return entities;
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
    ) => Promise<SortableModel<SubModel> | null>,
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

    const promises = entities.map(async (entity: SubModel) => {
      return await genSortableModelFunc(entity, terms);
    });

    await Promise.all(promises).then((results: any[]) => {
      results.forEach((result: any) => {
        if (result) {
          sortableEntities.push(result);
        }
      });
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

  protected isStartWithMatched(srcText: string, terms: string[]): boolean {
    if (srcText.length > 0) {
      for (let i = 0; i < terms.length; ++i) {
        if (new RegExp(`^${terms[i]}`, 'i').test(srcText)) {
          return true;
        }
      }
    }
    return false;
  }

  protected getTermsFromSearchKey(searchKey: string) {
    return searchKey.split(/[\s,]+/);
  }

  protected async initialEntitiesCache() {
    mainLogger.debug('initialEntitiesCache begin');
    if (this._cachedManager && !this._cachedManager.isStartInitial()) {
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
      mainLogger.info('base service _subscribe eventName:', eventName);
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
    doUpdateModel?: (updatedModel: SubModel) => Promise<SubModel>,
    doPartialNotify?: (
      originalModels: SubModel[],
      updatedModels: SubModel[],
      partialModels: Partial<Raw<SubModel>>[],
    ) => void,
  ): Promise<SubModel> {
    const id: number = partialModel.id
      ? partialModel.id
      : partialModel._id
      ? partialModel._id
      : 0;
    let result: SubModel;

    do {
      const originalModel = await this.getById(id);

      if (!originalModel) {
        mainLogger.warn('handlePartialUpdate: OriginalModel not found');
        throw new JSdkError(
          ERROR_CODES_SDK.GENERAL,
          `OriginalModel not found: modelId: ${id}`,
        );
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
          ? preHandlePartialModel(partialModel, originalModel)
          : partialModel,
        originalModel,
        doUpdateModel,
        doPartialNotify,
      );
    } while (false);

    return result;
  }

  getRollbackPartialModel(
    partialEntity: Partial<Raw<SubModel>>,
    originalEntity: SubModel,
  ): Partial<Raw<SubModel>> {
    const keys = Object.keys(partialEntity);
    const rollbackPartialEntity = _.pick(originalEntity, keys);

    keys.forEach((key: string) => {
      if (!rollbackPartialEntity.hasOwnProperty(key)) {
        rollbackPartialEntity[key] = undefined;
      }
    });
    return rollbackPartialEntity as Partial<Raw<SubModel>>;
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
    doUpdateModel: (updatedModel: SubModel) => Promise<SubModel>,
    doPartialNotify?: (
      originalModels: SubModel[],
      updatedModels: SubModel[],
      partialModels: Partial<Raw<SubModel>>[],
    ) => void,
  ): Promise<SubModel> {
    let result: SubModel;
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
        mainLogger.info('handlePartialUpdate: no changes, no need update');
        result = originalModel;
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

      let updateResult;
      try {
        updateResult = await doUpdateModel(mergedModel);
      } catch (error) {
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
        throw error;
      }

      result = updateResult;
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
