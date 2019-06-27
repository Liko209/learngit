/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:20:20
 * Copyright © RingCentral. All rights reserved.
 */
import { some } from 'lodash';
import { computed, action, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { PersonService, ContactType } from 'sdk/module/person';
import { Person, PHONE_NUMBER_TYPE } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import PhoneNumberModel from '@/store/models/PhoneNumber';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Caller } from 'sdk/module/RCItems/types';
import { ActionsProps } from './types';

class ActionsViewModel extends StoreViewModel<ActionsProps> {
  @observable personId?: number;

  constructor(props: ActionsProps) {
    super(props);
    this.reaction(
      () => this.props.caller,
      async (caller: Caller) => {
        await this.matchPerson(caller);
      },
      {
        fireImmediately: true,
      },
    );

    this.reaction(
      () => this._phoneNumberModel,
      async () => {
        await this.matchPerson(this.props.caller);
      },
    );

    this.reaction(
      () => this.person && this.person.rcPhoneNumbers,
      async () => {
        await this.matchPerson(this.props.caller);
      },
    );
  }

  @computed
  get _phoneNumberModel() {
    const caller = this.props.caller;
    if (!caller || this.isBlock) {
      return;
    }

    const matchNumber = caller.extensionNumber || caller.phoneNumber;
    if (!matchNumber) {
      return;
    }

    return getEntity<PhoneNumber, PhoneNumberModel, string>(ENTITY_NAME.PHONE_NUMBER, matchNumber);
  }

  @computed
  get phoneNumber() {
    return this._phoneNumberModel ? this._phoneNumberModel.formattedPhoneNumber : null;
  }

  @computed
  get isExt() {
    if (this.person && this.phoneNumber) {
      return some(this.person.phoneNumbers, {
        type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
        phoneNumber: this.phoneNumber,
      });
    }
    return false;
  }

  @computed
  get isBlock() {
    const caller = this.props.caller;
    if (!caller) {
      return true;
    }

    const { phoneNumber, extensionNumber } = caller;
    return !phoneNumber && !extensionNumber;
  }

  get _personService() {
    return ServiceLoader.getInstance<PersonService>(ServiceConfig.PERSON_SERVICE);
  }

  @computed
  get person() {
    if (!this.personId) {
      return null;
    }
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.personId);
  }

  @action
  async matchPerson(caller: Caller | undefined) {
    if (!caller || this.isBlock) {
      return;
    }

    const matchNumber = caller.extensionNumber || caller.phoneNumber;
    if (!matchNumber) {
      return;
    }

    const person = await this._personService.matchContactByPhoneNumber(
      matchNumber,
      ContactType.GLIP_CONTACT,
    );
    this.personId = person ? person.id : undefined;
  }

  @computed
  get shouldShowBlock() {
    const { canEditBlockNumbers } = this.props;

    if (!canEditBlockNumbers || this.isBlock || this.isExt) {
      return false;
    }

    return true;
  }
}

export { ActionsViewModel };
