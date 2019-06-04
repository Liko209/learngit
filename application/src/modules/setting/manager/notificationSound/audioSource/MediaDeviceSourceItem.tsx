/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-31 18:27:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiText } from 'jui/components/Text';

type MediaDeviceSourceItemProps = {
  value: MediaDeviceInfo;
};

const MediaDeviceSourceItem = withTranslation('translations')(
  ({ t, value: device }: MediaDeviceSourceItemProps & WithTranslation) => {
    let text = device.label;
    if (/default/gi.test(device.label)) {
      text = t('setting.default');
    } else {
      const builtIn = /(built-in|internal)/gi.test(device.label);
      if (builtIn) {
        switch (device.kind) {
          case 'audioinput':
            text = t('setting.builtInMicrophone');
            break;
          case 'audiooutput':
            text = t('setting.builtInSpeaker');
            break;
        }
      }
    }
    return <JuiText>{text}</JuiText>;
  },
);

export { MediaDeviceSourceItem, MediaDeviceSourceItemProps };
