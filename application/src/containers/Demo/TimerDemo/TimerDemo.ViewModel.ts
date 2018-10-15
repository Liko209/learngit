/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:09:11
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { loading } from '@/plugins/LoadingPlugin';
import { TimerDemoProps, TimerDemoViewProps } from './types';

class TimerDemoViewModel extends StoreViewModel<TimerDemoProps>
  implements TimerDemoViewProps {
  @observable
  text: string = 'Current Time';

  @observable
  now: number = Date.now();

  @computed
  get timerId() {
    return this.props.timerId;
  }

  onUpdateTimeClick = () => this.updateTime();
  onUpdateTimeWithLoadingClick = () => this.updateTimeWithLoading();
  onStartTimerClick = () => this.startTimer();
  onStopTimerClick = () => this.stopTimer();

  timer: NodeJS.Timer;

  @action
  async updateTime() {
    await this.wait(500);
    this.now = Date.now();
  }

  @action
  @loading
  async updateTimeWithLoading() {
    await this.wait(1000); // The circular progress shows after 500ms
    this.now = Date.now();
  }

  startTimer() {
    this.timer = setInterval(() => this.updateTimeWithLoading(), 1500);
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
