/*
 * @Author: ken.li
 * @Date: 2019-08-23 10:09:08
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent, ComponentType } from 'react';
import { JuiModalProps } from 'jui/components/Dialog/Modal';
import { dataAnalysis } from 'foundation/analysis';

function withEscTracking<T>(Component: ComponentType<JuiModalProps>) {
  return class WithEscTracking extends PureComponent<JuiModalProps> {
    render() {
      const onClose = (event: React.MouseEvent) => {
        if (this.props.onCancel) {
          dataAnalysis.track('Jup_Web/DT_general_kbShortcuts', {
            shortcut: 'escape',
          });
          this.props.onCancel(event);
        }
      };
      return <Component onClose={onClose} {...this.props} />;
    }
  };
}

export { withEscTracking };
