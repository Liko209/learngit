/*
 * @Author: Andy Hu
 * @Date: 2018-11-12 10:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { FromView } from './From.View';
import { FromViewModel } from './From.ViewModel';
import { FromProps } from './types';

const From = buildContainer<FromProps>({
  View: FromView,
  ViewModel: FromViewModel,
});

export { From };
