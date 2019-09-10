/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-08-15 10:13:01
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { Person } from 'sdk/module/person/entity';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PersonService } from 'sdk/module/person';
import { catchError } from '@/common/catchError';
import portalManager from '@/common/PortalManager';
import PersonModel from '@/store/models/Person';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { EMOJI_UNICODE_REGEX } from '@/common/postParser/utils';

const GLOBAL_MATCH_EMOJI = new RegExp(EMOJI_UNICODE_REGEX, 'g');
class CustomStatusViewModel extends StoreViewModel<Props> implements ViewProps {
  @observable emoji = '';
  @observable inputValue = '';
  @observable isLoading: boolean = false;
  constructor(props: ViewProps) {
    super(props);
    this.reaction(
      () => this._person,
      (person: PersonModel) => {
        const { awayStatus } = person;
        if (awayStatus) {
          const matchedEmoji = awayStatus.match(EMOJI_UNICODE_REGEX) || [];
          this.emoji = matchedEmoji[0] || '';
          this.inputValue = awayStatus.replace(GLOBAL_MATCH_EMOJI, () => {
            return '';
          });
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  @computed
  get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }
  @computed
  private get _person() {
    return getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      this.currentUserId,
    );
  }
  @catchError.flash({
    network: 'customstatus.shareCustomStatusNetworkError',
    server: 'customstatus.shareCustomStatusServerError',
  })
  @action
  save = async () => {
    this.isLoading = true;
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const value = this.emoji + this.inputValue.trim();

    await personService.setCustomStatus(this.currentUserId, value).catch(e => {
      this.isLoading = false;
      throw e;
    });
    this.isLoading && portalManager.dismissLast();
    this.isLoading = false;
  };
  @action
  handleEmojiChange = (native: string) => {
    this.emoji = native;
  };
  @action
  clearStatus = () => {
    this.inputValue = '';
    this.emoji = '';
  };
  @action
  handleInputValueChange = (value: string) => {
    this.inputValue = value;
  };

  @computed
  get showCloseBtn() {
    return !!this.inputValue.length || !!this.emoji.length;
  }
}

export { CustomStatusViewModel };
