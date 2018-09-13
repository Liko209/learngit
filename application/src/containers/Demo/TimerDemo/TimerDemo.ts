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
