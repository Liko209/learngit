/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiTitleBar } from 'jui/pattern/Dialer';
import { DialerTitleBarViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Minimize } from '../Minimize';
// import { DetachOrAttach } from '../DetachOrAttach';

type Props = DialerTitleBarViewProps & WithTranslation;
const ACTIONS = [Minimize];

@observer
class DialerTitleBarViewComponent extends React.Component<Props> {
  render() {
    const { timing, isDialer, t } = this.props;
    return (
      <JuiTitleBar
        label={isDialer ? t('dialer.newCall') : timing}
        Actions={ACTIONS}
      />
    );
  }
}

const DialerTitleBarView = withTranslation('translations')(
  DialerTitleBarViewComponent,
);

export { DialerTitleBarView };
