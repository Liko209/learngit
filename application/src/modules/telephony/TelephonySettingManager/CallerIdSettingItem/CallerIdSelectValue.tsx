/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 18:07:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiText } from 'jui/components/Text';
import { PhoneNumberRecord, PhoneNumberRecordProps } from './PhoneNumberRecord';

type CallerIdSelectValueProps = PhoneNumberRecordProps;

const CallerIdSelectValue = React.memo(({ value }: PhoneNumberRecordProps) => (
  <JuiText>
    <PhoneNumberRecord value={value} />
  </JuiText>
));

export { CallerIdSelectValue, CallerIdSelectValueProps };
