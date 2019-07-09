/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 18:07:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { IPhoneNumberRecord } from 'sdk/api/ringcentral/types/common';
import { PhoneFormatter } from '@/modules/common/container/PhoneFormatter';
import { i18nP } from '@/utils/i18nT';

type PhoneNumberRecordProps = {
  value: IPhoneNumberRecord;
};

const PhoneNumberRecord = ({ value }: PhoneNumberRecordProps) => {
  const { usageType, phoneNumber } = value;
  const formattedPhoneNumber =
    usageType !== 'Blocked' ? (
      <PhoneFormatter>{phoneNumber}</PhoneFormatter>
    ) : (
      i18nP('setting.phone.general.callerID.Blocked')
    );
  return <>{formattedPhoneNumber}</>;
};

export { PhoneNumberRecord, PhoneNumberRecordProps };
