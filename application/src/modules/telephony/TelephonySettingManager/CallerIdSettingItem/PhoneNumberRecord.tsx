/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 18:07:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { IPhoneNumberRecord } from 'sdk/api/ringcentral/types/common';
import { PhoneFormatter } from '@/modules/common/container/PhoneFormatter';

type PhoneNumberRecordProps = {
  value: IPhoneNumberRecord;
} & WithTranslation;

const PhoneNumberRecord = React.memo(
  withTranslation('translations')(({ value, t }: PhoneNumberRecordProps) => {
    const { usageType, phoneNumber } = value;
    const formattedPhoneNumber =
      usageType !== 'Blocked' ? (
        <PhoneFormatter>{phoneNumber}</PhoneFormatter>
      ) : (
        t('setting.phone.general.callerID.Blocked')
      );
    return <>{formattedPhoneNumber}</>;
  }),
);

export { PhoneNumberRecord, PhoneNumberRecordProps };
