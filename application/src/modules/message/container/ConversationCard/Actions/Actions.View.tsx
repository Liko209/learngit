/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiConversationActionBar } from 'jui/pattern/ConversationActionBar';
import { Like } from '@/modules/message/container/ConversationCard/Actions/Like';
import { Bookmark } from '@/modules/message/container/ConversationCard/Actions/Bookmark';
import { More } from '@/modules/message/container/ConversationCard/Actions/More';
import { Pin } from '@/modules/message/container/ConversationCard/Actions/Pin';
import { ActionsViewProps } from './types';
import { ConversationPageContext } from '../../ConversationPage/types';

type Props = ActionsViewProps & WithTranslation;

@observer
class ActionsViewComponent extends Component<Props> {
  render() {
    const { postId, groupId, isIntegration } = this.props;
    const { disableMoreAction } = this.context;
    const props = {
      Like: <Like id={postId} />,
      Bookmark: <Bookmark id={postId} />,
      Pin: !isIntegration && <Pin postId={postId} groupId={groupId} />,
      More: !disableMoreAction && <More id={postId} />,
    };
    return <JuiConversationActionBar {...props} />;
  }
}

ActionsViewComponent.contextType = ConversationPageContext;

const ActionsView = withTranslation('translations')(ActionsViewComponent);

export { ActionsView };
