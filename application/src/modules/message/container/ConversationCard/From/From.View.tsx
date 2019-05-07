/*
 * @Author: Andy Hu
 * @Date: 2018-11-12 10:48:00
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { FromViewProps } from './types';
import { JuiConversationCardFrom } from 'jui/pattern/ConversationCard/ConversationCardFrom';
import history from '@/history';

type Props = FromViewProps & WithTranslation;

@observer
class FromViewComponent extends Component<Props> {
  jumpToConversation = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    history.push(`/messages/${this.props.id}`);
  }
  render() {
    const { displayName, isTeam, isArchived, ...rest } = this.props;
    return (
      <JuiConversationCardFrom
        name={displayName}
        isTeam={isTeam}
        disabled={isArchived}
        onClick={this.jumpToConversation}
        {...rest}
      />
    );
  }
}

const FromView = withTranslation('translations')(FromViewComponent);

export { FromView };
