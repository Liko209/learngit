import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardBody,
  // JuiConversationCardFooter,
} from 'jui/pattern/ConversationCard';
import { Avatar } from '@/containers/Avatar';
import { translate } from 'react-i18next';
import { ConversationCardViewProps } from '@/containers/ConversationCard/types';
import { Actions } from '@/containers/ConversationCard/Actions';

@observer
export class ConversationCard extends React.Component<
  ConversationCardViewProps
> {
  constructor(props: ConversationCardViewProps) {
    super(props);
  }

  render() {
    const { id, post, creator, name, customStatus, createTime } = this.props;
    const { text } = post;
    const avatar = <Avatar uid={creator.id} size="medium" />;
    return (
      <JuiConversationCard
        data-name="conversation-card"
        data-id={post.id}
        Avatar={avatar}
      >
        <JuiConversationCardHeader
          data-name="conversation-card-header"
          name={name}
          time={createTime}
          status={customStatus}
        >
          <Actions id={id} />
        </JuiConversationCardHeader>
        <JuiConversationCardBody>
          <div
            style={{ fontSize: '14px', lineHeight: '24px', color: '#616161' }}
          >
            {text}
          </div>
        </JuiConversationCardBody>
        {/* <JuiConversationCardFooter>
          [conversation card footer]
        </JuiConversationCardFooter> */}
      </JuiConversationCard>
    );
  }
}

const ConversationCardView = translate('Conversations')(ConversationCard);

export { ConversationCardView };
