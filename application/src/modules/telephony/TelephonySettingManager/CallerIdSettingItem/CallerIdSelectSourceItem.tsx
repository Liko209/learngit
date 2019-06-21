/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 18:07:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { IPhoneNumberRecord } from 'sdk/api/ringcentral/types/common';

import { withTranslation, WithTranslation } from 'react-i18next';
import { PhoneFormatter } from '@/modules/common/container/PhoneFormatter';
import JuiText from 'jui/components/Text/Text';

type CallerIdSelectItemProps = {
  value: IPhoneNumberRecord;
};

const CallerIdSelectSourceItemComponent = ({
  value,
  t,
}: CallerIdSelectItemProps & WithTranslation) => {
  const { usageType, phoneNumber } = value;
  const formattedPhoneNumber =
    usageType !== 'Blocked' ? (
      <PhoneFormatter>{phoneNumber}</PhoneFormatter>
    ) : (
      t('setting.phone.general.callerID.Blocked')
    );
  return <JuiText>{formattedPhoneNumber}</JuiText>;
};

const CallerIdSelectSourceItem = withTranslation('translations')(
  CallerIdSelectSourceItemComponent,
);

export { CallerIdSelectSourceItem, CallerIdSelectItemProps };
