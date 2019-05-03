/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed } from 'mobx';
import { container } from 'framework';
import { TelephonyService } from '../../service';
import { TelephonyStore } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import {
  Person,
  PhoneNumberInfo,
  PHONE_NUMBER_TYPE,
} from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { DialerHeaderProps, DialerHeaderViewProps } from './types';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class DialerHeaderViewModel extends StoreViewModel<DialerHeaderProps>
  implements DialerHeaderViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get phone() {
    return this._telephonyStore.phoneNumber;
  }

  @computed
  get isExt() {
    if (this._person) {
      return this._person.phoneNumbers.some((info: PhoneNumberInfo) => {
        if (
          info.type === PHONE_NUMBER_TYPE.EXTENSION_NUMBER &&
          info.phoneNumber === this._telephonyStore.phoneNumber
        ) {
          return true;
        }
        return false;
      });
    }

    return true;
  }

  @computed
  get name() {
    if (this._person) {
      return this._person.userDisplayName;
    }
    return '';
  }

  @observable
  uid?: number;

  @observable
  extensionPhoneNumbers?: number[];

  constructor(props: DialerHeaderProps) {
    super(props);
    this.reaction(
      () => this._telephonyStore.phoneNumber,
      async (phoneNumber: string) => {
        const contact = await this._telephonyService.matchContactByPhoneNumber(
          phoneNumber,
        );
        if (contact) {
          this.uid = contact.id;
        }
      },
      { fireImmediately: true },
    );
  }

  @computed
  private get _person() {
    if (!this.uid) return null;
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.uid);
  }
}

export { DialerHeaderViewModel };
