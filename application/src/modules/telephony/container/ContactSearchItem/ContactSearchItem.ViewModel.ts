/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-28 17:23:27
 * Copyright © RingCentral. All rights reserved.
 */

import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';
import { computed, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ContactSearchItemProps } from './types';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { ENTITY_NAME } from '@/store';
import PhoneNumberModel from '@/store/models/PhoneNumber';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../store';

export class ContactSearchItemViewModel extends StoreViewModel<
  ContactSearchItemProps
> {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @observable.shallow
  _person?: any;

  @observable.shallow
  _phoneNumber?: any;

  _personFrame: number;
  _phoneNumberFrame: number;

  onAfterMount = () => {
    this._personFrame = requestAnimationFrame(() => {
      this._person = this.props.personId
        ? getEntity<Person, PersonModel>(
            ENTITY_NAME.PERSON,
            this.props.personId,
          )
        : undefined;
      delete this._personFrame;
    });

    this._phoneNumberFrame = requestAnimationFrame(() => {
      this._phoneNumber = this.props.phoneId
        ? getEntity(ENTITY_NAME.PHONE_NUMBER, this.props.phoneId)
        : undefined;
      delete this._phoneNumberFrame;
    });
  };

  dispose = () => {
    this._personFrame && cancelAnimationFrame(this._personFrame);
    this._phoneNumberFrame && cancelAnimationFrame(this._phoneNumberFrame);
    super.dispose();
  };

  @computed
  get uid() {
    return this._person && this._person.id;
  }

  @computed
  get name() {
    return this._person && (this._person.userDisplayName || this._person.email);
  }

  @computed
  get phoneNumber() {
    if (this.showDialIcon) {
      return this.props.directDial || '';
    }
    if (this._phoneNumber) {
      return (this._phoneNumber as PhoneNumberModel).formattedPhoneNumber;
    }
    return '';
  }

  @computed
  get isExt() {
    return (
      !!this.props.phoneNumberType &&
      this.props.phoneNumberType === PhoneNumberType.Extension
    );
  }

  @computed
  get showDialIcon() {
    return !!this.props.directDial;
  }

  @computed
  get isTransferPage() {
    return this._telephonyStore.isTransferPage;
  }

  @computed
  get selectedCallItemIndex() {
    return this._telephonyStore.selectedCallItem.index;
  }
}
