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
import { JuiCollapse } from 'jui/components/Collapse';
import { Like } from '@/containers/ConversationCard/Actions/Like';

type Props = FooterViewProps & WithNamespaces;
@observer
class FooterViewComponent extends Component<Props> {
  render() {
    const { id, likeCount } = this.props;
    const hasLike = likeCount > 0;
    return (
      <JuiCollapse mountOnEnter={true} unmountOnExit={true} in={hasLike}>
        <JuiConversationCardFooter
          likeCount={likeCount}
          Like={<Like id={id} />}
        />
      </JuiCollapse>
    );
  }
}

const FooterView = translate('Conversations')(FooterViewComponent);

export { FooterView };
