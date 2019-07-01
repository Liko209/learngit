/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 15:44:14
 * Copyright © RingCentral. All rights reserved.
 */
import { some } from 'lodash';
import { i18nP } from '@/utils/i18nT';
import { computed, observable, action } from 'mobx';
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
import { READ_STATUS } from 'sdk/module/RCItems/constants';
import { CALL_DIRECTION } from 'sdk/module/RCItems';

import { ContactInfoViewProps, ContactInfoProps } from './types';

class ContactInfoViewModel extends StoreViewModel<ContactInfoProps>
  implements ContactInfoViewProps {
  @observable personId?: number;

  constructor(props: ContactInfoProps) {
    super(props);
    this.reaction(
      () => this._caller,
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
        await this.matchPerson(this._caller);
      },
    );

    this.reaction(
      () => this.person && this.person.rcPhoneNumbers,
      async () => {
        await this.matchPerson(this._caller);
      },
    );
  }

  @computed
  private get _caller() {
    return this.props.caller;
  }

  @computed
  get _phoneNumberModel() {
    const caller = this._caller;
    if (!caller || this.isBlock) {
      return;
    }

    const matchNumber = caller.extensionNumber || caller.phoneNumber;
    if (!matchNumber) {
      return;
    }

    return getEntity<PhoneNumber, PhoneNumberModel, string>(
      ENTITY_NAME.PHONE_NUMBER,
      matchNumber,
    );
  }

  @computed
  get phoneNumber() {
    return this._phoneNumberModel
      ? this._phoneNumberModel.formattedPhoneNumber
      : null;
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
  get displayNumber() {
    if (this.isExt) {
      return `Ext. ${this.phoneNumber}`;
    }

    return this.phoneNumber;
  }

  get _personService() {
    return ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
  }

  @computed
  get person() {
    if (!this.personId) {
      return null;
    }
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.personId);
  }

  @computed
  get isUnread() {
    return this.props.readStatus === READ_STATUS.UNREAD;
  }

  @computed
  get isUnknownCaller() {
    const caller = this._caller;

    if (this.isBlock || !caller) {
      return true;
    }

    if (this.person || caller.name) {
      return false;
    }

    return true;
  }

  @computed
  get displayName() {
    const caller = this._caller;

    if (this.isBlock || !caller) {
      return i18nP('phone.unknownCaller');
    }

    if (this.person) {
      return this.person.userDisplayName;
    }

    if (caller.name) {
      return caller.name;
    }

    if (this.shouldShowUnknownCaller) {
      return i18nP('phone.unknownCaller');
    }

    return i18nP('phone.unknown');
  }

  @computed
  get shouldShowUnknownCaller() {
    const { direction, isMissedCall } = this.props;
    return direction === CALL_DIRECTION.INBOUND || isMissedCall;
  }

  @computed
  get isBlock() {
    const caller = this._caller;
    if (!caller) {
      return true;
    }

    const { phoneNumber, extensionNumber } = caller;
    return !phoneNumber && !extensionNumber;
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
}

export { ContactInfoViewModel };
