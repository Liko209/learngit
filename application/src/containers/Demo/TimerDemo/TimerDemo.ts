/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:09:06
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { LoadingPlugin } from '@/plugins/LoadingPlugin';
import { TimerDemoView } from './TimerDemo.View';
import { TimerDemoViewModel } from './TimerDemo.ViewModel';
import { TimerDemoProps } from './types';

const TimerDemo = buildContainer<TimerDemoProps>({
  ViewModel: TimerDemoViewModel,
  View: TimerDemoView,
  plugins: [new LoadingPlugin()],
});

export { TimerDemo, TimerDemoProps };
