/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 16:44:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiIconButton } from 'jui/components/Buttons';
import { withTranslation, WithTranslation } from 'react-i18next';

type Props = WithTranslation;

const TelephonyButtonComponent = (props: Props) => {
  return (
    <JuiIconButton tooltipTitle={props.t('telephony.Phone')}>
      phone
    </JuiIconButton>
  );
};

const TelephonyButton = withTranslation('translations')(TelephonyButtonComponent);

export { TelephonyButton };
