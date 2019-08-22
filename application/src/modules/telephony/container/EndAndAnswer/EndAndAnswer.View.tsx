/*
 * @Author: Spike.Yang
 * @Date: 2019-08-22 17:01:23
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { EndAndAnswerViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';
import { StyledActionText } from 'jui/pattern/Dialer';

type Props = EndAndAnswerViewProps & WithTranslation;

@observer
class EndAndAnswerViewComponent extends Component<Props> {
  private _handleAnswer = async () => {
    const { endAndAnswer } = this.props;
    endAndAnswer();
  };

  render() {
    const { t } = this.props;
    return (
      <>
        <JuiFabButton
          color="semantic.positive"
          size="mediumLarge"
          showShadow={false}
          tooltipPlacement="top"
          iconName="answer"
          aria-label={t('telephony.answerTheCall')}
          onClick={this._handleAnswer}
          data-test-automation-id="telephony-answer-btn"
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
