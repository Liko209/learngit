/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-10 16:17:36
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiMenuItem } from 'jui/components/Menus';
import { ViewProps } from './types';

type Props = ViewProps & WithTranslation;

@observer
class QuoteViewComponent extends React.Component<Props> {
  private _handleClick = () => {
    const { quote } = this.props;
    quote();
  };
  render() {
    const { disabled, t } = this.props;
    return (
      <JuiMenuItem
        icon="quote"
        onClick={this._handleClick}
        disabled={disabled}
        data-test-automation-id="message-action-quote"
      >
        {t('message.action.quote')}
      </JuiMenuItem>
    );
  }
}

const QuoteView = withTranslation('translations')(QuoteViewComponent);

export { QuoteView };
