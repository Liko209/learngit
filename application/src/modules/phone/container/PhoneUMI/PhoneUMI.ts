/*
 * @Author: isaac.liu
 * @Date: 2019-05-29 13:52:57
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { PhoneUMIView } from './PhoneUMI.View';
import { PhoneUMIViewModel } from './PhoneUMI.ViewModel';
import { PhoneUMIProps, PhoneUMIType } from './types';

const PhoneUMI = buildContainer<PhoneUMIProps>({
  View: PhoneUMIView,
  ViewModel: PhoneUMIViewModel,
});

export { PhoneUMI, PhoneUMIType };
