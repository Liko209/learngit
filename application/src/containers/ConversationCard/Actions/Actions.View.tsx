/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiConversationActionBar } from 'jui/pattern/ConversationActionBar';
import { Like } from '@/containers/ConversationCard/Actions/Like';
import { Bookmark } from '@/containers/ConversationCard/Actions/Bookmark';
import { More } from '@/containers/ConversationCard/Actions/More';
import { Pin } from '@/containers/ConversationCard/Actions/Pin';
import { ActionsProps } from './types';
import { ConversationPageContext } from '../../ConversationPage/types';

type Props = ActionsProps & WithTranslation;

@observer
class ActionsViewComponent extends Component<Props> {
  render() {
    const { postId, groupId } = this.props;
    const { disableMoreAction } = this.context;
    const props = {
      Like: <Like id={postId} />,
      Bookmark: <Bookmark id={postId} />,
      Pin: <Pin postId={postId} groupId={groupId} />,
      More: !disableMoreAction && <More id={postId} />,
    };
    return <JuiConversationActionBar {...props} />;
  }
}

ActionsViewComponent.contextType = ConversationPageContext;

const ActionsView = withTranslation('translations')(ActionsViewComponent);

export { ActionsView };
