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
  getTitle = () => {
    const {
      isForward,
      isDialer,
      isTransfer,
      canCompleteTransfer,
      t,
      timing,
    } = this.props;

    switch (true) {
      case isForward:
        return t('telephony.forwardCall');

      case isTransfer:
        return canCompleteTransfer
          ? t('telephony.action.transfer')
          : t('telephony.action.transferring');

      case isDialer:
        return t('dialer.newCall');

      default:
        return timing;
    }
  };
  render() {
    return <JuiTitleBar label={this.getTitle()} Actions={ACTIONS} />;
  }
}

const DialerTitleBarView = withTranslation('translations')(
  DialerTitleBarViewComponent,
);

export { DialerTitleBarView };
