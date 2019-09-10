/*
 * @Author: ken.li
 * @Date: 2019-08-30 18:15:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent, ComponentType } from 'react';
import { JuiModalProps } from 'jui/components/Dialog/Modal';
import { analyticsCollector } from '@/AnalyticsCollector';
import { SHORT_CUT_KEYS } from '@/AnalyticsCollector/constants';

function withEscTracking(Component: ComponentType<JuiModalProps>) {
  return class WithEscTracking extends PureComponent<JuiModalProps> {
    onEscTracking = (reason?: string) => {
      if (reason === 'escapeKeyDown') {
        analyticsCollector.shortcuts(SHORT_CUT_KEYS.ESCAPE);
      }
    };
    render() {
      return <Component onEscTracking={this.onEscTracking} {...this.props} />;
    }
  };
}

export { withEscTracking };
