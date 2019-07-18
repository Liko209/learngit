/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-24 09:46:29
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  JuiInputFooterContainer,
  JuiInputFooterItem,
} from 'jui/pattern/MessageInput/InputFooter';
import { TypingIndicator } from './TypingIndicator';
import { observer } from 'mobx-react';
import { InputFooterViewProps } from './types';
import moize from 'moize';
import { withTranslation } from 'react-i18next';

@observer
class InputFooterViewComponent extends React.Component<InputFooterViewProps> {
  private _getMarkupTips = moize((t, show) => {
    const content = t('message.markupTips');
    return (
      <JuiInputFooterItem
        show={show}
        align={'right'}
        content={content}
        data-test-automation-id="markupTips"
      />
    );
  });

  private _getTypingIndicator = moize((show, typingList) => <TypingIndicator show={show} typingList={typingList} />);

  render() {
    const {
      t,
      shouldShowMarkupTips,
      typingList,
      shouldShowTypingIndicator,
    } = this.props;
    return (
      <JuiInputFooterContainer>
        {this._getMarkupTips(t, shouldShowMarkupTips)}
        {this._getTypingIndicator(shouldShowTypingIndicator, typingList)}
      </JuiInputFooterContainer>
    );
  }
}

const InputFooterView = withTranslation()(InputFooterViewComponent);
export { InputFooterView };
