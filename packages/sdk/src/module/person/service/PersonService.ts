/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 17:18:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IPersonService } from './IPersonService';
import {
  Person,
  PhoneNumberModel,
  SanitizedExtensionModel,
  HeadShotModel,
} from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { daoManager } from '../../../dao';
import { PersonDao } from '../dao';
import { Api } from '../../../api';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { Raw } from '../../../framework/model';
import { FEATURE_TYPE, FEATURE_STATUS } from '../../group/entity';

import { PersonController } from '../controller/PersonController';
import { SOCKET } from '../../../service/eventKey';
import { ContactType } from '../types';
import { PersonEntityCacheController } from '../controller/PersonEntityCacheController';
import { SYNC_SOURCE, ChangeModel } from '../../../module/sync/types';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';

class PersonService extends EntityBaseService<Person>
  implements IPersonService {
  private _personController: PersonController;
  constructor() {
    super(true, daoManager.getDao(PersonDao), {
      basePath: '/person',
      networkClient: Api.glipNetworkClient,
    });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.PERSON]: this.handleIncomingData,
      }),
    );

    this.setCheckTypeFunc((id: number) => {
      return GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_PERSON);
    });
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
  }

  async getPersonsByIds(ids: number[]): Promise<Person[]> {
    return await this.getPersonController().getPersonsByIds(ids);
  }

  async getAllCount() {
    return await this.getPersonController().getAllCount();
  }

  getHeadShotWithSize(
    uid: number,
    headshot_version: string,
    headshot: HeadShotModel,
    size: number,
  ): string | null {
    return this.getPersonController().getHeadShotWithSize(
      uid,
      headshot_version,
      headshot,
      size,
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

  async matchContactByPhoneNumber(
    phoneNumber: string,
    contactType: ContactType,
  ): Promise<Person | null> {
    return await this.getPersonController().matchContactByPhoneNumber(
      phoneNumber,
      contactType,
    );
  }

  public async refreshPersonData(personId: number): Promise<void> {
    await this.getPersonController().refreshPersonData(personId);
  }

  getSoundexById(id: number): string[] {
    const cache = this.getEntityCacheController() as PersonEntityCacheController;
    return cache.getSoundexById(id);
  }

  isCacheValid(person: Person): boolean {
    return this.getPersonController().isCacheValid(person);
  }

  getPhoneNumbers(
    person: Person,
    eachPhoneNumber: (phoneNumber: PhoneNumber) => void,
  ): void {
    this.getPersonController().getPhoneNumbers(person, eachPhoneNumber);
  }
}

export { PersonService };
