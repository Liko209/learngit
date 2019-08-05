/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 18:07:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { CallerIdItem } from '../../container/CallerIdSelector/CallerIdItem';
import { ICallerPhoneNumber } from '../../container/CallerIdSelector/types';

type CallerIdSelectItemProps = {
  value: ICallerPhoneNumber;
};
const CallerIdSelectSourceItem = ({ value }: CallerIdSelectItemProps) => {
  return (
    <CallerIdItem
      {...value}
      key={value.phoneNumber}
      value={value.phoneNumber}
    />
  );
};

export { CallerIdSelectSourceItem, CallerIdSelectItemProps };
