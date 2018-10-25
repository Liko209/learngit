/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiConversationPostText,
} from 'jui/pattern/ConversationCard';
import PostModel from '@/store/models/Post';

type Props = {
  formatHtml: string;
  currentUserId: number;
  atMentionIdMaps: {number?: string};
  _post: PostModel;
  atMentionId: string|number;
  postId: number;
};
@observer
class FormatMessagesView extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { formatHtml, currentUserId, atMentionId } = this.props;
    return (
      <React.Fragment>
        <JuiConversationPostText
          currentUserId={currentUserId}
          atMentionId={atMentionId}
        >
          <div dangerouslySetInnerHTML={{ __html: formatHtml }} />
        </JuiConversationPostText>
      </React.Fragment>
    );
  }
}
export { FormatMessagesView };
