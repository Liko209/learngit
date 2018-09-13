import { MouseEvent } from 'react';

type TimerDemoProps = {
  id: number;
};

type TimerDemoViewProps = {
  id: number;
  text: string;
  now: number;
  onUpdateTimeClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onStartTimerClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onStopTimerClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export { TimerDemoProps, TimerDemoViewProps };
