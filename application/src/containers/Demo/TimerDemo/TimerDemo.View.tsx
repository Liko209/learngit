/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:09:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { TimerDemoViewProps } from './types';

const TimerDemoView = (props: TimerDemoViewProps) => {
  return (
    <div>
      {props.timerId} - {props.text} : {props.now}
      <div>
        <button onClick={props.onUpdateTimeClick}>updateTime()</button>
        <button onClick={props.onUpdateTimeWithLoadingClick}>
          updateTimeWithLoading()
        </button>
        <button onClick={props.onStartTimerClick}>startTimer()</button>
        <button onClick={props.onStopTimerClick}>stopTimer()</button>
      </div>
    </div>
  );
};

export { TimerDemoView };
