/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiConversationActionBar } from 'jui/pattern/ConversationActionBar';
import { Like } from '@/containers/ConversationCard/Actions/Like';
import { Bookmark } from '@/containers/ConversationCard/Actions/Bookmark';
import { More } from '@/containers/ConversationCard/Actions/More';
import { ActionsViewProps } from './types';

type Props = ActionsViewProps & WithNamespaces;

@observer
class ActionsViewComponent extends Component<
  Props & {
    onMoreActionFocus: () => void;
    onMoreActionBlur: () => void;
    tabIndex: number;
  }
> {
  render() {
    const { id, onMoreActionFocus, onMoreActionBlur, tabIndex } = this.props;

    const props = {
      Like: <Like id={id} />,
      Bookmark: <Bookmark id={id} />,
      More: (
        <More
          id={id}
          handleFocus={onMoreActionFocus}
          handleBlur={onMoreActionBlur}
          tabIndex={tabIndex}
        />
      ),
    };
    return <JuiConversationActionBar {...props} />;
  }
}

const ActionsView = translate('Conversations')(ActionsViewComponent);

export { ActionsView };
