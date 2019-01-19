/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 16:44:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { JuiIconButton } from 'jui/src/components/Buttons';

const MeetingButton = () => {
  return <JuiIconButton tooltipTitle={t('Meetings')}>meetings</JuiIconButton>;
};

export { MeetingButton };
