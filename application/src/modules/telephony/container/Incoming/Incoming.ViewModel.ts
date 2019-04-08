/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import { container } from 'framework';
import { TelephonyService } from '../../service';
import { TelephonyStore } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { IncomingProps, IncomingViewProps } from './types';

class IncomingViewModel extends StoreViewModel<IncomingProps>
  implements IncomingViewProps {
  private _telephonyService: TelephonyService = container.get(TelephonyService);
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get phone() {
    return this._telephonyStore.phoneNumber;
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

  constructor(props: IncomingProps) {
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

export { IncomingViewModel };
