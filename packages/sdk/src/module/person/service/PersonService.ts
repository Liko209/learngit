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

class PersonService extends EntityBaseService<Person>
  implements IPersonService {
  static serviceName = 'PersonService';
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
  }

  protected getPersonController() {
    if (!this._personController) {
      this._personController = new PersonController();
      this._personController.setDependentController(
        this.getEntitySource(),
        this.getEntityCacheSearchController(),
      );
    }
    return this._personController;
  }

  handleIncomingData = async (persons: Raw<Person>[]): Promise<void> => {
    await this.getPersonController().handleIncomingData(persons);
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

  isValidPerson(person: Person) {
    return this.getPersonController().isValid(person);
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
    e164PhoneNumber: string,
    contactType: ContactType,
  ): Promise<Person | null> {
    return await this.getPersonController().matchContactByPhoneNumber(
      e164PhoneNumber,
      contactType,
    );
  }

  public async refreshPersonData(personId: number): Promise<void> {
    await this.getPersonController().refreshPersonData(personId);
  }
}

export { PersonService };
