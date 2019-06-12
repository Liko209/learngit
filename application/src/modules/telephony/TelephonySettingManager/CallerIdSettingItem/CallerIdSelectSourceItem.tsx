/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 18:07:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { IPhoneNumberRecord } from 'sdk/api/ringcentral/types/common';
import { PhoneFormatter } from '@/modules/common/container/PhoneFormatter';
import JuiText from 'jui/components/Text/Text';

type CallerIdSelectItemProps = {
  value: IPhoneNumberRecord;
};

const CallerIdSelectSourceItem = ({ value }: CallerIdSelectItemProps) => {
  const { usageType, phoneNumber } = value;
  const formattedPhoneNumber =
    usageType !== 'Blocked' ? (
      <PhoneFormatter>{phoneNumber}</PhoneFormatter>
    ) : (
      phoneNumber
    );
  return <JuiText>{formattedPhoneNumber}</JuiText>;
};

export { CallerIdSelectSourceItem, CallerIdSelectItemProps };
