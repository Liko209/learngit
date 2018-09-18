/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:09:14
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEvent } from 'react';

type TimerDemoProps = {
  id: number;
};

type TimerDemoViewProps = {
  id: number;
  text: string;
  now: number;
  onUpdateTimeClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onUpdateTimeWithLoadingClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onStartTimerClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onStopTimerClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export { TimerDemoProps, TimerDemoViewProps };
