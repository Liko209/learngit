/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 17:49:41
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  JuiResponsiveLayout,
  withResponsive,
  VISUAL_MODE,
} from 'jui/foundation/Layout/Responsive';
import { SettingRouter } from '../SettingRouter';
import { SettingLeftRail } from '../SettingLeftRail';

const LeftRailResponsive = withResponsive(SettingLeftRail, {
  maxWidth: 360,
  minWidth: 200,
  defaultWidth: 268,
  visualMode: VISUAL_MODE.AUTOMATIC,
  enable: {
    right: true,
  },
  priority: 1,
});

const RouterResponsive = withResponsive(SettingRouter, {
  minWidth: 400,
  priority: 2,
});

@observer
class Setting extends Component {
  render() {
    return (
      <JuiResponsiveLayout>
        <LeftRailResponsive />
        <RouterResponsive />
      </JuiResponsiveLayout>
    );
  }
}

export { Setting };
