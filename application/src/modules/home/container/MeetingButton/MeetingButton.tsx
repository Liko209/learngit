/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 16:44:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { JuiIconButton } from 'jui/components/Buttons';

const MeetingButton = () => {
  return (
    <JuiIconButton tooltipTitle={i18next.t('meeting.Meetings')}>
      meetings
    </JuiIconButton>
  );
};

export { MeetingButton };
