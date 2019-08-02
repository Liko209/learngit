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

  componentWillReceiveProps(nextProps: ActivityTimerViewProps) {
    if (!window.jupiterElectron) {
      return;
    }

    const isOffline = nextProps.isOffline && nextProps.presence === PRESENCE.UNAVAILABLE;

    if (nextProps.presence === PRESENCE.AVAILABLE || isOffline) {
      window.jupiterElectron.resetActivityTimer &&
        window.jupiterElectron.resetActivityTimer();
    } else {
      window.jupiterElectron.clearActivityTimer &&
        window.jupiterElectron.clearActivityTimer();
    }
  }

  render() {
    const { presence, isOffline } = this.props;

    const isAvaliableOrOffline =
      presence === PRESENCE.AVAILABLE ||
      (presence === PRESENCE.UNAVAILABLE && isOffline)

    const needTimer = !window.jupiterElectron && isAvaliableOrOffline

    return (
      needTimer ? (
        <IdleTimer
          ref={this.idleTimerRef}
          element={document}
          onIdle={this.onIdle}
          onAction={this.setOnline}
          debounce={DEBOUNCE}
          timeout={FIFTEEN_MINUTE}
        />
      ) : null
    );
  }
}

export { ActivityTimerView };
