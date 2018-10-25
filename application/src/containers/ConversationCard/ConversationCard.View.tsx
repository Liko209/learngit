import React from 'react';
import { observer } from 'mobx-react';
import { JuiDivider } from 'jui/components/Divider';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardFooter,
} from 'jui/pattern/ConversationCard';
import { Avatar } from '@/containers/Avatar';
import { translate } from 'react-i18next';
import { ConversationCardViewProps } from '@/containers/ConversationCard/types';
import { Actions } from '@/containers/ConversationCard/Actions';
import { FileItems } from '@/containers/ConversationCard/Files';

@observer
export class ConversationCard extends React.Component<
  ConversationCardViewProps
> {
  constructor(props: ConversationCardViewProps) {
    super(props);
  }

  render() {
    const { id, post, creator, displayTitle, createTime } = this.props;
    const { text, itemIds } = post;
    const avatar = <Avatar uid={creator.id} size="medium" />;

    return (
      <React.Fragment>
        <JuiConversationCard
          data-name="conversation-card"
          data-id={post.id}
          Avatar={avatar}
        >
          <JuiConversationCardHeader
            data-name="conversation-card-header"
            name={displayTitle}
            time={createTime}
          >
            <Actions id={id} />
          </JuiConversationCardHeader>
          {/* todo: content */}
          <div
            style={{ fontSize: '14px', lineHeight: '24px', color: '#616161' }}
          >
            {text}
          </div>
          <FileItems ids={itemIds} />
          {/* todo: content */}
          <JuiConversationCardFooter>
            {/* todo: footer */}
          </JuiConversationCardFooter>
        </JuiConversationCard>
        <JuiDivider />
      </React.Fragment>
    );
  }
}

const ConversationCardView = translate('Conversations')(ConversationCard);

export { ConversationCardView };
