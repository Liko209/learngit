/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AnswerViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';
import { StyledActionText } from 'jui/pattern/Dialer';

type Props = AnswerViewProps & WithTranslation;

@observer
class AnswerViewComponent extends Component<Props> {
  private _handleAnswer = () => {
    const { ignore } = this.props;
    ignore();
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
        <StyledActionText>{t('telephony.action.answer')}</StyledActionText>
      </>
    );
  }
}

const AnswerView = withTranslation('translations')(AnswerViewComponent);

export { AnswerView };
