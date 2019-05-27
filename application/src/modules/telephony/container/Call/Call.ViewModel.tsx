/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:47
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework';
import { AbstractViewModel } from '@/base';
import { TelephonyService } from '../../service';
import { CallProps, CallViewProps } from './types';
import { computed, action } from 'mobx';
import { promisedComputed } from 'computed-async-mobx';
import { getEntity, getGlobalValue, getSingleEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import GroupModel from '@/store/models/Group';
import { CONVERSATION_TYPES } from '@/constants';
import {
  Person,
  PhoneNumberInfo,
  PHONE_NUMBER_TYPE,
} from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { analyticsCollector } from '@/AnalyticsCollector';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { CALLING_OPTIONS } from 'sdk/module/profile';

class CallViewModel extends AbstractViewModel<CallProps>
  implements CallViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _featuresFlagsService: FeaturesFlagsService = container.get(
    FeaturesFlagsService,
  );

  private _currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

  @computed
  private get _uid() {
    const { id, groupId } = this.props;
    if (id) {
      return id;
    }
    if (groupId) {
      const group = this._group;
      if (group) {
        return group.membersExcludeMe[0];
      }
    }
    return 0;
  }

  @computed
  get phoneNumber() {
    const { phone } = this.props;
    if (phone) {
      return phone;
    }
    return this._phoneNumberFormPerson;
  }

  @computed
  private get _person() {
    if (this._uid) {
      return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this._uid);
    }
    return null;
  }

  @computed
  private get _group() {
    const { groupId } = this.props;
    if (groupId) {
      return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId);
    }
    return null;
  }

  @computed
  private get _phoneNumberFormPerson() {
    let phoneNumber: string = '';
    if (this._person && this._person.phoneNumbers.length) {
      phoneNumber = this._person.phoneNumbers[0].phoneNumber;
      this._person.phoneNumbers.some((info: PhoneNumberInfo) => {
        if (info.type === PHONE_NUMBER_TYPE.EXTENSION_NUMBER) {
          phoneNumber = info.phoneNumber;
          return true;
        }
        return false;
      });
    }

    return phoneNumber;
  }

  @action
  call = () => {
    const isJupiterDefaultPhoneApp =
      getSingleEntity(ENTITY_NAME.PROFILE, 'callOption') ===
      CALLING_OPTIONS.GLIP;
    if (this.phoneNumber) {
      if (isJupiterDefaultPhoneApp) {
        this._telephonyService.directCall(this.phoneNumber);
      } else {
        this._telephonyService.makeRCPhoneCall(this.phoneNumber);
      }
    }
  }

  @action
  trackCall = (analysisSource?: string) => {
    if (analysisSource) {
      analyticsCollector.makeOutboundCall(analysisSource);
    }
  }

  showIcon = promisedComputed(false, async () => {
    const phoneNumber = this.phoneNumber;
    const { id, groupId } = this.props;
    const canUseTelephony = await this._featuresFlagsService.canUseTelephony();
    if (canUseTelephony && phoneNumber) {
      if (id) {
        return this._currentUserId !== id;
      }
      if (groupId) {
        const group = this._group;
        if (group) {
          return group.type === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE;
        }
      }
    }
    return false;
  });
}

export { CallViewModel };
