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

type Props = AnswerViewProps & WithTranslation;

@observer
class AnswerViewComponent extends Component<Props> {
  private _handleAnswer = async () => {
    const { ignore } = this.props;
    ignore();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiFabButton
        color="semantic.positive"
        size="moreLarge"
        showShadow={false}
        tooltipPlacement="top"
        iconName="phone"
        tooltipTitle={t('telephony.action.Answer')}
        aria-label={t('telephony.answerTheCall')}
        onClick={this._handleAnswer}
        data-test-automation-id="telephony-answer-btn"
      />
    );
  }
}

const AnswerView = withTranslation('translations')(AnswerViewComponent);

export { AnswerView };
