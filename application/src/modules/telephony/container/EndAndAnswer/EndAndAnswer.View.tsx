/*
 * @Author: Spike.Yang
 * @Date: 2019-08-22 17:01:23
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { EndAndAnswerViewProps } from './types';
import { StyledActionText, JuiEndAndAnswer } from 'jui/pattern/Dialer';
import { analyticsCollector } from '@/AnalyticsCollector';

type Props = EndAndAnswerViewProps & WithTranslation;

@observer
class EndAndAnswerViewComponent extends Component<Props> {
  private _handleEndAndAnswer = () => {
    const { endAndAnswer } = this.props;
    endAndAnswer();

    analyticsCollector.endAndAnswerCall();
  };

  render() {
    const { t } = this.props;
    return (
      <>
        <JuiEndAndAnswer
          ariaLabel={t('telephony.endAndAnswerTheCall')}
          handleClick={this._handleEndAndAnswer}
        />
        <StyledActionText>
          {t('telephony.action.endAndAnswer')}
        </StyledActionText>
      </>
    );
  }
}

const EndAndAnswerView = withTranslation('translations')(
  EndAndAnswerViewComponent,
);

export { EndAndAnswerView };
