/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { FooterViewProps } from './types';
import { JuiConversationCardFooter } from 'jui/pattern/ConversationCard';
import { Like } from '@/containers/ConversationCard/Actions/Like';

type Props = FooterViewProps & WithNamespaces;
@observer
class FooterViewComponent extends Component<Props> {
  render() {
    const { id, likeCount } = this.props;

    const props = {
      likeCount,
      Like: <Like id={id} />,
    };
    return <JuiConversationCardFooter {...props} />;
  }
}

const FooterView = translate('translations')(FooterViewComponent);

export { FooterView };
