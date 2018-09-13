import { action, observable } from 'mobx';
import { AbstractViewModel } from '@/base';
import { loading } from '@/plugins/LoadingPlugin';
import { TimerDemoProps, TimerDemoViewProps } from './types';

class TimerDemoViewModel extends AbstractViewModel
  implements TimerDemoViewProps {
  @observable
  id: number;
  @observable
  text: string = 'Current Time';
  @observable
  now: number = Date.now();
  @observable
  timer: NodeJS.Timer;
  onUpdateTimeClick = () => this.updateTime();
  onStartTimerClick = () => this.startTimer();
  onStopTimerClick = () => this.stopTimer();

  constructor({ id }: TimerDemoProps) {
    super();
    this.id = id;
  }

  componentDidMount() {
    this.updateTime();
  }

  @action.bound
  @loading
  async updateTime() {
    await this.wait(500);
    this.now = Date.now();
  }

  startTimer() {
    this.timer = setInterval(() => this.updateTime(), 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  async wait(time: number) {
    return new Promise((resolve: Function) => {
      setTimeout(resolve, time);
    });
  }
}
export { TimerDemoViewModel };
