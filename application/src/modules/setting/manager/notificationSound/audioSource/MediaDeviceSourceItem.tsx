/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-31 18:27:28
 * Copyright © RingCentral. All rights reserved.
 */
import { DeviceNameHelper } from './DeviceNameHelper';
import { i18nP } from '@/utils/i18nT';

type MediaDeviceSourceItemProps = {
  value: MediaDeviceInfo;
  source: MediaDeviceInfo[];
};
type Props = MediaDeviceSourceItemProps;

const MediaDeviceSourceItem = ({ value, source }: Props) => DeviceNameHelper.getDeviceName(value, source, i18nP);

export { MediaDeviceSourceItem, MediaDeviceSourceItemProps };
