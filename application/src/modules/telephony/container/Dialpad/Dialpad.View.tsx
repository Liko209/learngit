/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-22 13:36:24
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ViewProps } from './types';
import { JuiMinimizedCall, JuiDialpadBtn } from 'jui/pattern/Dialer';
import { Mute } from '../Mute';
import { End } from '../End';

type DialpadProps = ViewProps & WithTranslation;

const Actions = [() => <Mute type="fab" />, () => <End size="medium" />];

class DialpadViewComponent extends React.Component<DialpadProps> {
  render() {
    const { showMinimized, maximize, name, timing, t } = this.props;
    return showMinimized ? (
      <JuiMinimizedCall
        onClick={maximize}
        Actions={Actions}
        name={name ? name : t('telephony.unknownCaller')}
        label={typeof timing === 'string' ? timing : t(timing.key)}
        data-test-automation-id="telephony-minimized-view"
      />
    ) : (
      <JuiDialpadBtn
        size="medium"
        iconName="keypad"
        disableRipple={true}
        data-test-automation-id="telephony-dialpad-btn"
      />
    );
  }
}

const DialpadView = withTranslation('translations')(DialpadViewComponent);

export { DialpadView };
