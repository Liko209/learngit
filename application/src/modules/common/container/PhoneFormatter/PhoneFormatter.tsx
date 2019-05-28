/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 18:01:16
 * Copyright © RingCentral. All rights reserved.
 */
import { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { ENTITY_NAME } from '@/store/constants';
import { getEntity } from '@/store/utils/entities';

@observer
class PhoneFormatter extends Component<{ children: string }> {
  @computed
  get parsedPhoneNumber() {
    const { children: phoneNumber } = this.props;
    let result = phoneNumber;
    if (phoneNumber) {
      result = getEntity(ENTITY_NAME.PHONE_NUMBER, phoneNumber)
        .formattedPhoneNumber;
    }
    return result;
  }

  render() {
    return this.parsedPhoneNumber;
  }
}

export { PhoneFormatter };
