import React from 'react';
import { TimerDemoViewProps } from './types';

const TimerDemoView = (props: TimerDemoViewProps) => {
  return (
    <div>
      {props.id} - {props.text} : {props.now}
      <div>
        <button onClick={props.onUpdateTimeClick}>updateTime()</button>
        <button onClick={props.onStartTimerClick}>startTimer()</button>
        <button onClick={props.onStopTimerClick}>stopTimer()</button>
      </div>
    </div>
  );
};

export { TimerDemoView };
