/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 16:00:47
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { ViewProps } from './types';
import { JuiRecentCallBtn } from 'jui/pattern/Dialer';
import { withTranslation, WithTranslation } from 'react-i18next';

type Props = ViewProps & WithTranslation;
@observer
class RecentCallBtnComponent extends React.Component<Props> {
  render() {
    const {
      t,
      shouldShowRecentCallOrBackBtn,
      shouldShowRecentCallBtn,
      jumpToRecentCall,
      backToDialer,
    } = this.props;
    return (
      shouldShowRecentCallBtn &&
      (!shouldShowRecentCallOrBackBtn ? (
        <JuiRecentCallBtn
          tooltipTitle={t('telephony.action.recentCall')}
          automationId='recentCallBtn'
          iconName='history'
          handleClick={jumpToRecentCall}
        />
      ) : (
        <JuiRecentCallBtn
          iconName='dialer'
          handleClick={backToDialer}
          tooltipTitle={t('telephony.action.backToDialer')}
          automationId='telephony-dialpad-btn'
        />
      ))
    );
  }
}

const RecentCallBtnView = withTranslation('translations')(
  RecentCallBtnComponent,
);

export { RecentCallBtnView };
