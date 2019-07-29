/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-25 07:16:52
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, createRef } from 'react';
import { observer } from 'mobx-react';
import IdleTimer from 'react-idle-timer'
import { PRESENCE } from 'sdk/module/presence/constant';
import { ActivityTimerViewProps } from './types';

const FIFTEEN_MINUTE = 15 * 1000 * 60;
const DEBOUNCE = 250;

@observer
class ActivityTimerView extends Component<ActivityTimerViewProps> {
  idleTimerRef = createRef<IdleTimer>();

  onIdle = () => {
    this.props.setOffline();
  }

  setOnline = () => {
    this.props.setOnline();
    this.idleTimerRef.current && this.idleTimerRef.current.reset();
  }

  render() {
    const { presence } = this.props;
    const notNeedTimer =
      window.jupiterElectron ||
      (presence !== PRESENCE.UNAVAILABLE && presence !== PRESENCE.AVAILABLE)
    return (
      notNeedTimer ? null : (
        <IdleTimer
          ref={this.idleTimerRef}
          element={document}
          onIdle={this.onIdle}
          onAction={this.setOnline}
          debounce={DEBOUNCE}
          timeout={FIFTEEN_MINUTE}
        />
      )
    );
  }
}

export { ActivityTimerView };
