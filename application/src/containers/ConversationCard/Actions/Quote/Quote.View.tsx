/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-10 16:17:36
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiMenuItem } from 'jui/components';
import { ViewProps } from './types';

type Props = ViewProps & WithNamespaces;

@observer
class QuoteViewComponent extends React.Component<Props> {
  private _handleClick = () => {
    const { quote } = this.props;
    quote();
  }
  render() {
    return (
      <JuiMenuItem icon="feedback" onClick={this._handleClick}>
        Quote
      </JuiMenuItem>
    );
  }
}

const QuoteView = translate('Conversations')(QuoteViewComponent);

export { QuoteView };
