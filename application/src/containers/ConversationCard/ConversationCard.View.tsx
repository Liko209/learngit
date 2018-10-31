import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardBody,
  // JuiConversationCardFooter,
} from 'jui/pattern/ConversationCard';
import { Avatar } from '@/containers/Avatar';
import { ConversationCardViewProps } from '@/containers/ConversationCard/types';
import { Actions } from '@/containers/ConversationCard/Actions';
import { idsToConversationSheet } from '@/containers/ConversationSheet';
import { FormatMessages } from '../FormatMessages';
// import { idToPostItemComponent } from '@/containers/PostItems';
@observer
export class ConversationCard extends React.Component<
  ConversationCardViewProps
> {
  constructor(props: ConversationCardViewProps) {
    super(props);
  }
  render() {
    const {
      id,
      post,
      creator,
      name,
      createTime,
      customStatus,
      itemIds,
    } = this.props;
    if (!creator.id) {
      return null;
    }

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
            name={name}
            time={createTime}
            status={customStatus}
          >
            <Actions id={id} />
          </JuiConversationCardHeader>
          <JuiConversationCardBody>
            <FormatMessages postId={post.id} />
            {idsToConversationSheet(itemIds)}
          </JuiConversationCardBody>
          {/*<JuiConversationCardFooter>*/}
          {/*/!* todo: footer *!/*/}
          {/*</JuiConversationCardFooter>*/}
        </JuiConversationCard>
      </React.Fragment>
    );
  }
}

const ConversationCardView = ConversationCard;

export { ConversationCardView };
