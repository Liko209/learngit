/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:34
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { kDefaultPhoneTabPath } from '@/modules/phone/container/LeftRail/constant';
import { PhoneUMI, PhoneUMIType } from '@/modules/phone/container/PhoneUMI';
import { SubModuleConfig } from '@/modules/home/types';
import { JuiIconography } from 'jui/foundation/Iconography';
import { container } from 'framework/ioc';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';

function getUrl() {
  return getGlobalValue(GLOBAL_KEYS.CURRENT_TELEPHONY_TAB) || kDefaultPhoneTabPath
}

const config: SubModuleConfig = {
  nav: async () => ({
    url: getUrl,
    icon: 'leftNavPhone_border',
    Icon: (
      <JuiIconography iconColor={['grey', '900']}>
        leftNavPhone_border
      </JuiIconography>
    ),
    IconSelected: <JuiIconography>leftNavPhone</JuiIconography>,
    title: 'telephony.Phone',
    umi: <PhoneUMI type={PhoneUMIType.ALL} />,
    placement: 'top',
    disable: async () => !container.get(FeaturesFlagsService).canUseTelephony(),
  })
};

export { config };
