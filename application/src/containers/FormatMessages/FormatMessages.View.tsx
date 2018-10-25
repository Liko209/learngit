/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiConversationPostText } from 'jui/pattern/ConversationCard';

type Props = {
  formatHtml: string;
};
@observer
class FormatMessagesView extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { formatHtml } = this.props;
    return (
      <React.Fragment>
        <JuiConversationPostText>
          <div dangerouslySetInnerHTML={{ __html: formatHtml }} />
        </JuiConversationPostText>
      </React.Fragment>
    );
  }
}
export { FormatMessagesView };
