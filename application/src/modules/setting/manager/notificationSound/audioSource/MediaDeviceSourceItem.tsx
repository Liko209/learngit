/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-31 18:27:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiText } from 'jui/components/Text';
import { DeviceNameHelper } from './DeviceNameHelper';

type MediaDeviceSourceItemProps = {
  value: MediaDeviceInfo;
  source: MediaDeviceInfo[];
};
type Props = MediaDeviceSourceItemProps & WithTranslation;

const MediaDeviceSourceItem = withTranslation('translations')(
  ({ value, source, t }: Props) => (
    <JuiText>{DeviceNameHelper.getDeviceName(value, source, t)}</JuiText>
  ),
);

export { MediaDeviceSourceItem, MediaDeviceSourceItemProps };
