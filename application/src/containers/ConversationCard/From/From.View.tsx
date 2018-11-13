/*
 * @Author: Andy Hu
 * @Date: 2018-11-12 10:48:00
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { FromViewProps } from './types';
import JuiConversationCardFrom from 'jui/src/pattern/ConversationCard/ConversationCardFrom';
import history from '@/history';

type Props = FromViewProps & WithNamespaces;

@observer
class FromViewComponent extends Component<Props> {
  jumpToConversation = () => {
    history.push(`/messages/${this.props.id}`);
  }
  render() {
    const { displayName, isTeam } = this.props;
    return (
      <JuiConversationCardFrom
        name={displayName}
        isTeam={isTeam}
        onClick={this.jumpToConversation}
      />
    );
  }
}

const FromView = translate('Conversations')(FromViewComponent);

export { FromView };
