/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:09:11
 * Copyright © RingCentral. All rights reserved.
 */
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
  onUpdateTimeClick = () => this.updateTime();
  onUpdateTimeWithLoadingClick = () => this.updateTimeWithLoading();
  onStartTimerClick = () => this.startTimer();
  onStopTimerClick = () => this.stopTimer();

  timer: NodeJS.Timer;

  constructor({ id }: TimerDemoProps) {
    super();
    this.id = id;
  }

  componentDidMount() {
    this.updateTime();
  }

  @action.bound
  async updateTime() {
    await this.wait(500);
    this.now = Date.now();
  }

  @action.bound
  @loading
  async updateTimeWithLoading() {
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
