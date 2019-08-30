/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 17:18:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PhoneNumber } from 'sdk/module/phoneNumber/entity';

import { Api } from 'sdk/api';
import { daoManager } from 'sdk/dao';
import { Raw, IdModel } from 'sdk/framework/model';
import { EntityBaseService } from 'sdk/framework/service/EntityBaseService';
import { ChangeModel, SYNC_SOURCE } from 'sdk/module/sync/types';
import { SOCKET } from 'sdk/service/eventKey';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

import { SubscribeController } from '../../base/controller/SubscribeController';
import { FEATURE_STATUS, FEATURE_TYPE } from '../../group/entity';
import { PersonController } from '../controller/PersonController';
import { PersonEntityCacheController } from '../controller/PersonEntityCacheController';
import { PersonDao } from '../dao';
import {
  HeadShotModel,
  Person,
  PhoneNumberModel,
  SanitizedExtensionModel,
} from '../entity';
import { IPersonService } from './IPersonService';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SyncUserConfig } from 'sdk/module/sync/config/SyncUserConfig';
import { PERSON_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { PerformanceTracer } from 'foundation/performance';
import { EditablePersonInfo, HeadShotInfo } from '../types';
import { Nullable } from 'sdk/types';

class PersonService extends EntityBaseService<Person>
  implements IPersonService {
  private _personController: PersonController;
  constructor() {
    super({ isSupportedCache: true }, daoManager.getDao(PersonDao), {
      basePath: '/person',
      networkClient: Api.glipNetworkClient,
    });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.PERSON]: this.handleSocketIOData,
      }),
    );

    this.setCheckTypeFunc((id: number) =>
      GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_PERSON),
    );
  }

  protected buildEntityCacheController() {
    return PersonEntityCacheController.buildPersonEntityCacheController(this);
  }

  protected getPersonController() {
    if (!this._personController) {
      this._personController = new PersonController();
      this._personController.setDependentController(
        this.getEntitySource(),
        this.getEntityCacheSearchController(),
        this.getEntityCacheController(),
      );
    }
    return this._personController;
  }

  protected async initialEntitiesCache() {
    const performanceTracer = PerformanceTracer.start();
    const persons = await super.initialEntitiesCache();
    performanceTracer.end({
      key: PERSON_PERFORMANCE_KEYS.PREPARE_PERSON_CACHE,
      count: persons && persons.length,
    });
    return persons;
  }

  handleSocketIOData = async (persons: Raw<Person>[]): Promise<void> => {
    await this.getPersonController().handleIncomingData(
      persons,
      SYNC_SOURCE.SOCKET,
    );
  };

  handleIncomingData = async (
    persons: Raw<Person>[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void> => {
    await this.getPersonController().handleIncomingData(
      persons,
      source,
      changeMap,
    );
  };

  async getPersonsByIds(ids: number[]): Promise<Person[]> {
    return await this.getPersonController().getPersonsByIds(ids);
  }

  getCurrentPerson(): Promise<Person | null> {
    return this.getPersonController().getCurrentPerson();
  }

  async getAllCount() {
    return await this.getPersonController().getAllCount();
  }

  getHeadShotWithSize(
    uid: number,
    headshot: HeadShotModel,
    size: number,
    headshotVersion?: number,
  ): string | null {
    return this.getPersonController().getHeadShotWithSize(
      uid,
      headshot,
      size,
      headshotVersion,
    );
  }

  async buildPersonFeatureMap(
    personId: number,
  ): Promise<Map<FEATURE_TYPE, FEATURE_STATUS>> {
    return await this.getPersonController().buildPersonFeatureMap(personId);
  }

  getName(person: Person) {
    return this.getPersonController().getName(person);
  }

  getFirstName(person: Person): string {
    return this.getPersonController().getFirstName(person);
  }

  getLastName(person: Person): string {
    return this.getPersonController().getLastName(person);
  }

  isVisiblePerson(person: Person): boolean {
    return this.getPersonController().isVisible(person);
  }

  getEmailAsName(person: Person) {
    return this.getPersonController().getEmailAsName(person);
  }

  getFullName(person: Person) {
    return this.getPersonController().getFullName(person);
  }

  getAvailablePhoneNumbers(
    companyId: number,
    phoneNumbersData?: PhoneNumberModel[],
    extensionData?: SanitizedExtensionModel,
  ) {
    return this.getPersonController().getAvailablePhoneNumbers(
      companyId,
      phoneNumbersData,
      extensionData,
    );
  }

  async matchContactByPhoneNumber(phoneNumber: string): Promise<Person | null> {
    return await this.getPersonController().matchContactByPhoneNumber(
      phoneNumber,
    );
  }

  public async refreshPersonData(personId: number): Promise<void> {
    await this.getPersonController().refreshPersonData(personId);
  }

  getSoundexById(id: number): string[] {
    const cache = this.getEntityCacheController() as PersonEntityCacheController;
    return cache.getSoundexById(id);
  }

  isValidPerson(person: Person): boolean {
    return this.getPersonController().isValidPerson(person);
  }

  getPhoneNumbers(
    person: Person,
    eachPhoneNumber: (phoneNumber: PhoneNumber) => void,
  ): void {
    this.getPersonController().getPhoneNumbers(person, eachPhoneNumber);
  }

  protected canRequest(): boolean {
    const syncConfig = ServiceLoader.getInstance<EntityBaseService<IdModel>>(
      ServiceConfig.SYNC_SERVICE,
    ).getUserConfig() as SyncUserConfig;

    return syncConfig && syncConfig.getFetchedRemaining();
  }

  setCustomStatus(personId: number, status: string): Promise<Nullable<Person>> {
    return this.getPersonController().personActionController.setCustomStatus(
      personId,
      status,
    );
  }

  async editPersonalInfo(
    basicInfo?: EditablePersonInfo,
    headshotInfo?: HeadShotInfo,
  ) {
    await this.getPersonController().personActionController.editPersonalInfo(
      basicInfo,
      headshotInfo,
    );
  }
}

export { PersonService };
